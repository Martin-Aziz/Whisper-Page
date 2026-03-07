import { useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";
import { tauriService } from "@/services/tauriService";
import { extractDocumentTitle } from "@/services/markdownService";

/**
 * Provides file operation handlers: open, save, save-as, new.
 * Encapsulates all Tauri dialog and file I/O logic.
 *
 * @example
 * const { openFile, saveFile } = useFileOperations();
 */
export function useFileOperations() {
  const { setMarkdownContent, markdownContent } = useEditorStore();
  const { currentFile, setCurrentFile, setDirty, recordSave, addRecentFile } =
    useFileStore();

  /**
   * Opens a file picker and loads the selected file into the editor.
   * Adds it to the recent files list on success.
   */
  const openFile = useCallback(async () => {
    const path = await tauriService.openFilePicker();
    if (!path) return;

    try {
      const content = await tauriService.readFile(path);
      const name = path.split("/").pop() ?? path.split("\\").pop() ?? "Untitled";

      setMarkdownContent(content);
      setCurrentFile(path);
      addRecentFile({ path, name, lastOpened: Math.floor(Date.now() / 1000) });
    } catch (err) {
      console.error("Failed to open file:", err);
    }
  }, [setMarkdownContent, setCurrentFile, addRecentFile]);

  /**
   * Opens the given path directly (e.g. from recent files list).
   */
  const openFilePath = useCallback(
    async (path: string) => {
      try {
        const content = await tauriService.readFile(path);
        const name = path.split("/").pop() ?? path.split("\\").pop() ?? "Untitled";

        setMarkdownContent(content);
        setCurrentFile(path);
        addRecentFile({ path, name, lastOpened: Math.floor(Date.now() / 1000) });
      } catch (err) {
        console.error("Failed to open file path:", path, err);
      }
    },
    [setMarkdownContent, setCurrentFile, addRecentFile]
  );

  /**
   * Saves the current content to disk.
   * If no file is open yet, delegates to `saveFileAs`.
   * Uses atomic write (write temp → rename) via the Rust backend.
   */
  const saveFile = useCallback(async () => {
    if (!currentFile) {
      await saveFileAs();
      return;
    }

    try {
      await tauriService.writeFile(currentFile, markdownContent);
      recordSave();
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  }, [currentFile, markdownContent, recordSave]);

  /**
   * Opens a save-as dialog and saves the current content to the chosen path.
   * Derives a suggested filename from the document's first heading.
   */
  const saveFileAs = useCallback(async () => {
    const suggestedName =
      extractDocumentTitle(markdownContent).replace(/[/\\:*?"<>|]/g, "_") +
      ".md";

    const path = await tauriService.saveFilePicker(suggestedName);
    if (!path) return;

    try {
      await tauriService.writeFile(path, markdownContent);
      const name = path.split("/").pop() ?? "Untitled.md";
      setCurrentFile(path);
      recordSave();
      addRecentFile({ path, name, lastOpened: Math.floor(Date.now() / 1000) });
    } catch (err) {
      console.error("Failed to save file as:", err);
    }
  }, [markdownContent, setCurrentFile, recordSave, addRecentFile]);

  /**
   * Creates a new empty document.
   * Does NOT prompt to save unsaved changes — callers should check `isDirty`
   * and prompt before calling this if needed.
   */
  const newFile = useCallback(() => {
    setMarkdownContent("");
    setCurrentFile(null);
    setDirty(false);
  }, [setMarkdownContent, setCurrentFile, setDirty]);

  return { openFile, openFilePath, saveFile, saveFileAs, newFile };
}
