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
  const { setMarkdownContent, markdownContent, setMode } = useEditorStore();
  const { currentFile, setFolder, setCurrentFile, setDirty, recordSave, addRecentFile } =
    useFileStore();

  /**
   * Opens a save-as dialog and saves the current content to the chosen path.
   * Derives a suggested filename from the document's first heading.
   */
  const saveFileAs = useCallback(async (): Promise<boolean> => {
    const isHtml = currentFile?.toLowerCase().endsWith(".html") || currentFile?.toLowerCase().endsWith(".htm");
    const extension = isHtml ? ".html" : ".md";

    const suggestedName =
      extractDocumentTitle(markdownContent).replace(/[/\\:*?"<>|]/g, "_") +
      extension;

    const path = await tauriService.saveFilePicker(suggestedName);
    if (!path) return false;

    try {
      await tauriService.writeFile(path, markdownContent);
      const name = path.split("/").pop() ?? "Untitled.md";
      setCurrentFile(path);
      recordSave();
      addRecentFile({ path, name, lastOpened: Math.floor(Date.now() / 1000) });
      return true;
    } catch (err) {
      console.error("Failed to save file as:", err);
      return false;
    }
  }, [currentFile, markdownContent, setCurrentFile, recordSave, addRecentFile]);

  /**
   * Saves the current content to disk.
   * If no file is open yet, delegates to `saveFileAs`.
   * Uses atomic write (write temp → rename) via the Rust backend.
   */
  const saveFile = useCallback(async (): Promise<boolean> => {
    if (!currentFile) {
      return await saveFileAs();
    }

    try {
      await tauriService.writeFile(currentFile, markdownContent);
      recordSave();
      return true;
    } catch (err) {
      console.error("Failed to save file:", err);
      return false;
    }
  }, [currentFile, markdownContent, recordSave, saveFileAs]);

  const confirmLossyTransition = useCallback(async (): Promise<boolean> => {
    if (!useFileStore.getState().isDirty) return true;

    if (typeof window === "undefined" || typeof window.confirm !== "function") {
      return false;
    }

    const shouldSaveFirst = window.confirm(
      "You have unsaved changes.\n\nPress OK to save before continuing, or Cancel to choose discard/cancel."
    );

    if (shouldSaveFirst) {
      const didSave = await saveFile();
      return didSave && !useFileStore.getState().isDirty;
    }

    return window.confirm(
      "Discard unsaved changes and continue?\n\nPress OK to discard, or Cancel to stay on the current document."
    );
  }, [saveFile]);

  /**
   * Opens a file picker and loads the selected file into the editor.
   * Adds it to the recent files list on success.
   */
  const openFile = useCallback(async (): Promise<boolean> => {
    const path = await tauriService.openFilePicker();
    if (!path) return false;

    if (path !== currentFile) {
      const canContinue = await confirmLossyTransition();
      if (!canContinue) return false;
    }

    try {
      const content = await tauriService.readFile(path);
      const name = path.split("/").pop() ?? path.split("\\").pop() ?? "Untitled";

      setMarkdownContent(content);
      setCurrentFile(path);
      const isHtml = name.toLowerCase().endsWith(".html") || name.toLowerCase().endsWith(".htm");
      setMode(isHtml ? "source" : "read-only");
      addRecentFile({ path, name, lastOpened: Math.floor(Date.now() / 1000) });
      return true;
    } catch (err) {
      console.error("Failed to open file:", err);
      return false;
    }
  }, [currentFile, setMarkdownContent, setCurrentFile, addRecentFile, setMode, confirmLossyTransition]);

  /**
   * Opens a folder picker and loads all markdown files into the sidebar.
   */
  const openFolder = useCallback(async (): Promise<boolean> => {
    const folderPath = await tauriService.openFolderPicker();
    if (!folderPath) return false;

    const canContinue = await confirmLossyTransition();
    if (!canContinue) return false;

    try {
      const entries = await tauriService.readDirectory(folderPath);
      const mdFiles = entries
        .filter((entry) =>
          !entry.isDirectory &&
          entry.name &&
          (entry.name.toLowerCase().endsWith(".md") ||
            entry.name.toLowerCase().endsWith(".markdown") ||
            entry.name.toLowerCase().endsWith(".txt") ||
            entry.name.toLowerCase().endsWith(".html") ||
            entry.name.toLowerCase().endsWith(".htm"))
        )
        .map((entry) => ({
          name: entry.name,
          // Handle both posix and windows paths loosely
          path: folderPath.endsWith("/") || folderPath.endsWith("\\")
            ? `${folderPath}${entry.name}`
            : `${folderPath}/${entry.name}`
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setFolder(folderPath, mdFiles);
      return true;
    } catch (err) {
      console.error("Failed to open folder:", err);
      return false;
    }
  }, [setFolder, confirmLossyTransition]);

  /**
   * Opens the given path directly (e.g. from recent files list).
   */
  const openFilePath = useCallback(
    async (path: string): Promise<boolean> => {
      if (path !== currentFile) {
        const canContinue = await confirmLossyTransition();
        if (!canContinue) return false;
      }

      try {
        const content = await tauriService.readFile(path);
        const name = path.split("/").pop() ?? path.split("\\").pop() ?? "Untitled";

        setMarkdownContent(content);
        setCurrentFile(path);
        const isHtml = name.toLowerCase().endsWith(".html") || name.toLowerCase().endsWith(".htm");
        setMode(isHtml ? "source" : "read-only");
        addRecentFile({ path, name, lastOpened: Math.floor(Date.now() / 1000) });
        return true;
      } catch (err) {
        console.error("Failed to open file path:", path, err);
        return false;
      }
    },
    [currentFile, setMarkdownContent, setCurrentFile, addRecentFile, setMode, confirmLossyTransition]
  );

  /**
   * Creates a new empty document.
   * Prompts to save/discard when there are unsaved changes.
   */
  const newFile = useCallback(async (): Promise<boolean> => {
    const canContinue = await confirmLossyTransition();
    if (!canContinue) return false;

    setMarkdownContent("");
    setCurrentFile(null);
    setMode("wysiwyg");
    setDirty(false);
    return true;
  }, [setMarkdownContent, setCurrentFile, setDirty, setMode, confirmLossyTransition]);

  return { openFile, openFolder, openFilePath, saveFile, saveFileAs, newFile };
}
