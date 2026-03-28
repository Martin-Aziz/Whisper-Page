import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useFileOperations } from "./useFileOperations";

/**
 * Registers global keyboard shortcuts and cleans them up on unmount.
 *
 * Shortcuts defined:
 *  - Cmd/Ctrl + N      → New file
 *  - Cmd/Ctrl + O      → Open file
 *  - Cmd/Ctrl + S      → Save
 *  - Cmd/Ctrl + Shift + S → Save As
 *  - Cmd/Ctrl + P      → Export PDF modal
 *  - Cmd/Ctrl + \      → Toggle sidebar
 *  - Cmd/Ctrl + Shift + F → Toggle focus mode
 *  - Cmd/Ctrl + E      → Toggle source / Rich Text mode
 *  - F11               → Toggle fullscreen
 */
export function useKeyboardShortcuts() {
  const { toggleSidebar, setFocusMode, isFocusMode, openExportModal, setMode, mode } =
    useEditorStore();
  const { openFile, saveFile, saveFileAs, newFile } = useFileOperations();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "n") {
        e.preventDefault();
        void newFile();
        return;
      }

      if (mod && e.key === "o") {
        e.preventDefault();
        void openFile();
        return;
      }

      if (mod && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        void saveFile();
        return;
      }

      if (mod && e.shiftKey && e.key === "S") {
        e.preventDefault();
        void saveFileAs();
        return;
      }

      if (mod && e.key === "p") {
        e.preventDefault();
        openExportModal();
        return;
      }

      if (mod && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (mod && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setFocusMode(!isFocusMode);
        return;
      }

      if (mod && e.key === "e") {
        e.preventDefault();
        setMode(mode === "wysiwyg" ? "source" : "wysiwyg");
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, [
    newFile,
    openFile,
    saveFile,
    saveFileAs,
    openExportModal,
    toggleSidebar,
    setFocusMode,
    isFocusMode,
    setMode,
    mode,
  ]);
}
