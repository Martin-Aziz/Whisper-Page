import { invoke } from "@tauri-apps/api/core";
import { open as dialogOpen, save as dialogSave } from "@tauri-apps/plugin-dialog";

/** Metadata returned from the Rust backend for a file. */
export interface FileMetadata {
  path: string;
  name: string;
  size: number;
  modified: number | null;
  isReadonly: boolean;
}

/** Options passed to the PDF export command. */
export interface PdfExportOptions {
  outputPath: string;
  pageSize: "A4" | "Letter" | "Legal";
  marginMm: number;
  includePageNumbers: boolean;
}

/** Result returned from the PDF export command. */
export interface PdfExportResult {
  outputPath: string;
  sizeBytes: number;
}

/**
 * Thin abstraction over Tauri IPC commands.
 * Isolates all `invoke()` calls so components never import from @tauri-apps directly.
 * In test environments this module can be mocked at the module boundary.
 */
export const tauriService = {
  /**
   * Opens a native file picker filtered to `.md` files.
   * @returns Absolute path of the selected file, or null if cancelled.
   */
  async openFilePicker(): Promise<string | null> {
    const result = await dialogOpen({
      multiple: false,
      filters: [
        { name: "Markdown", extensions: ["md", "markdown", "txt"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    return typeof result === "string" ? result : null;
  },

  /**
   * Opens a native save dialog.
   * @param defaultName - Suggested file name (e.g. "Untitled.md")
   * @returns Absolute path chosen by the user, or null if cancelled.
   */
  async saveFilePicker(defaultName = "Untitled.md"): Promise<string | null> {
    return await dialogSave({
      defaultPath: defaultName,
      filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
    });
  },

  /**
   * Opens a save dialog for PDF output.
   * @param defaultName - Suggested file name (e.g. "Document.pdf")
   */
  async savePdfPicker(defaultName = "Document.pdf"): Promise<string | null> {
    return await dialogSave({
      defaultPath: defaultName,
      filters: [{ name: "PDF Document", extensions: ["pdf"] }],
    });
  },

  /**
   * Reads the full UTF-8 content of a file.
   * @throws If the path does not exist or is not readable.
   */
  async readFile(path: string): Promise<string> {
    return await invoke<string>("read_file", { path });
  },

  /**
   * Atomically writes content to a file path.
   * @throws If the write fails (permissions, disk full, etc.)
   */
  async writeFile(path: string, content: string): Promise<void> {
    await invoke<void>("write_file", { path, content });
  },

  /** Returns true if the file exists on disk. */
  async fileExists(path: string): Promise<boolean> {
    return await invoke<boolean>("file_exists", { path });
  },

  /** Returns file metadata (size, modified time, read-only status). */
  async getFileMetadata(path: string): Promise<FileMetadata> {
    return await invoke<FileMetadata>("get_file_metadata", { path });
  },

  /**
   * Exports the provided HTML to a PDF via headless Chrome.
   * @throws If Chrome is not found or the export fails.
   */
  async exportToPdf(
    htmlContent: string,
    options: PdfExportOptions
  ): Promise<PdfExportResult> {
    return await invoke<PdfExportResult>("export_to_pdf", {
      htmlContent,
      options: {
        output_path: options.outputPath,
        page_size: options.pageSize,
        margin_mm: options.marginMm,
        include_page_numbers: options.includePageNumbers,
      },
    });
  },

  /** Toggles the main window between fullscreen and windowed mode. */
  async toggleFullscreen(): Promise<void> {
    await invoke<void>("toggle_fullscreen");
  },

  /**
   * Sets the OS window title.
   * @param title - e.g. "• README.md — Lumina" (bullet = unsaved changes)
   */
  async setWindowTitle(title: string): Promise<void> {
    // Guard: Tauri may not be available in browser-based dev/test environments
    if (typeof (window as Window & { __TAURI__?: unknown }).__TAURI__ === "undefined") return;
    await invoke<void>("set_window_title", { title });
  },
};
