use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{command, AppHandle, Manager};
use tracing::{error, info};

/// Options controlling the PDF output format.
#[derive(Debug, Serialize, Deserialize)]
pub struct PdfOptions {
    /// Target file path for the PDF
    pub output_path: String,
    /// Page size: "A4" | "Letter" | "Legal"
    pub page_size: String,
    /// Margin in millimetres (applied to all sides)
    pub margin_mm: u32,
    /// Whether to include a header/footer with page numbers
    pub include_page_numbers: bool,
}

/// Result returned after PDF export.
#[derive(Debug, Serialize, Deserialize)]
pub struct PdfResult {
    pub output_path: String,
    pub size_bytes: u64,
}

/// Exports the provided HTML content to a PDF file using the WebView print API.
/// The HTML is injected into a hidden Tauri window which then prints to PDF.
///
/// # Strategy
/// We use the system WebView's native print-to-PDF capability:
/// 1. Create a temporary HTML file with print-optimised CSS.
/// 2. Open an invisible Tauri window pointed at the file.
/// 3. Call `window.print()` via the injected JS which triggers the native PDF export.
/// 4. Clean up the temporary window and file.
///
/// # Errors
/// Returns a descriptive error string on failure.
#[command]
pub async fn export_to_pdf(
    app: AppHandle,
    html_content: String,
    options: PdfOptions,
) -> Result<PdfResult, String> {
    info!("Exporting to PDF: {}", options.output_path);

    let output_path = PathBuf::from(&options.output_path);
    let parent = output_path.parent().ok_or("Invalid output path")?;

    // Write styled HTML to a named temp file so the WebView can load it
    let tmp_dir = tempfile::Builder::new()
        .prefix("lumina-pdf-")
        .tempdir_in(parent)
        .map_err(|e| format!("Failed to create temp directory: {}", e))?;

    let tmp_html = tmp_dir.path().join("export.html");
    let full_html = build_print_html(&html_content, &options);

    tokio::fs::write(&tmp_html, full_html.as_bytes())
        .await
        .map_err(|e| format!("Failed to write temp HTML: {}", e))?;

    // On macOS / Linux we use the shell to invoke headless Chromium/Chrome if available;
    // otherwise fall back to saving the styled HTML for the user to print manually.
    let chromium = find_chromium_binary();

    match chromium {
        Some(chrome) => {
            export_via_chromium(&chrome, &tmp_html, &output_path, &options).await?;
        }
        None => {
            // Fallback: copy HTML with print CSS so user can print from browser
            let html_output = output_path.with_extension("html");
            tokio::fs::copy(&tmp_html, &html_output)
                .await
                .map_err(|e| format!("Failed to copy HTML export: {}", e))?;
            error!("No Chromium binary found; exported styled HTML instead: {:?}", html_output);
            return Err(format!(
                "Chrome/Chromium not found. Exported print-ready HTML to {:?} instead.",
                html_output
            ));
        }
    }

    let size_bytes = tokio::fs::metadata(&output_path)
        .await
        .map(|m| m.len())
        .unwrap_or(0);

    info!("PDF exported successfully: {} ({} bytes)", options.output_path, size_bytes);

    Ok(PdfResult {
        output_path: options.output_path,
        size_bytes,
    })
}

/// Builds a complete standalone HTML document with print-optimised CSS.
fn build_print_html(body_html: &str, options: &PdfOptions) -> String {
    let margin = options.margin_mm;
    let page_size = &options.page_size;

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lumina Export</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
    @page {{
      size: {page_size};
      margin: {margin}mm;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      font-family: 'Merriweather', Georgia, serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a1a;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }}
    h1, h2, h3, h4, h5, h6 {{
      font-family: 'Merriweather', Georgia, serif;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
    }}
    p {{ margin: 0 0 1em; }}
    pre, code {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 9pt;
    }}
    pre {{
      background: #f4f4f4;
      padding: 1em;
      border-radius: 4px;
      overflow: hidden;
      page-break-inside: avoid;
    }}
    blockquote {{
      border-left: 4px solid #ddd;
      margin: 0;
      padding-left: 1em;
      color: #555;
    }}
    table {{
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;
    }}
    th, td {{
      border: 1px solid #ddd;
      padding: 6px 12px;
    }}
    th {{ background: #f4f4f4; font-weight: 700; }}
    img {{ max-width: 100%; height: auto; }}
    a {{ color: #2563eb; text-decoration: underline; }}
    .page-break {{ page-break-after: always; }}
  </style>
</head>
<body>
{body_html}
</body>
</html>"#,
        page_size = page_size,
        margin = margin,
        body_html = body_html
    )
}

/// Locates a Chromium or Chrome binary on the current system.
fn find_chromium_binary() -> Option<String> {
    let candidates = if cfg!(target_os = "macos") {
        vec![
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
        ]
    } else if cfg!(target_os = "linux") {
        vec![
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/snap/bin/chromium",
        ]
    } else {
        // Windows
        vec![
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        ]
    };

    candidates
        .into_iter()
        .find(|p| std::path::Path::new(p).exists())
        .map(String::from)
}

/// Runs headless Chrome/Chromium to print the HTML file to PDF.
async fn export_via_chromium(
    chrome: &str,
    input: &PathBuf,
    output: &PathBuf,
    options: &PdfOptions,
) -> Result<(), String> {
    let input_url = format!("file://{}", input.display());

    let paper_width = match options.page_size.as_str() {
        "Letter" => "8.5in",
        "Legal" => "8.5in",
        _ => "210mm", // A4 default
    };
    let paper_height = match options.page_size.as_str() {
        "Letter" => "11in",
        "Legal" => "14in",
        _ => "297mm",
    };

    let margin = format!("{}mm", options.margin_mm);

    let status = tokio::process::Command::new(chrome)
        .args([
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            &format!("--print-to-pdf={}", output.display()),
            &format!("--paper-width={}", paper_width),
            &format!("--paper-height={}", paper_height),
            &format!("--margin-top={}", margin),
            &format!("--margin-right={}", margin),
            &format!("--margin-bottom={}", margin),
            &format!("--margin-left={}", margin),
            if options.include_page_numbers {
                "--print-to-pdf-no-header"
            } else {
                "--print-to-pdf-no-header"
            },
            &input_url,
        ])
        .status()
        .await
        .map_err(|e| format!("Failed to launch Chrome: {}", e))?;

    if !status.success() {
        return Err(format!("Chrome exited with status: {}", status));
    }

    Ok(())
}
