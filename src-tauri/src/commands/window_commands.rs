use tauri::{command, AppHandle, Manager};
use tracing::info;

/// Toggles the main window between fullscreen and windowed mode.
#[command]
pub async fn toggle_fullscreen(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Main window not found")?;

    let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
    window
        .set_fullscreen(!is_fullscreen)
        .map_err(|e| e.to_string())?;

    info!("Fullscreen toggled: {}", !is_fullscreen);
    Ok(())
}

/// Updates the window title bar to reflect the current file and modification state.
///
/// # Arguments
/// * `title` - The new window title (e.g. "MyDocument.md — Lumina" or "• MyDocument.md — Lumina" for unsaved)
#[command]
pub async fn set_window_title(app: AppHandle, title: String) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Main window not found")?;

    window.set_title(&title).map_err(|e| e.to_string())?;
    Ok(())
}
