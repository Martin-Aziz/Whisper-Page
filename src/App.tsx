import { useEffect } from "react";
import EditorContainer from "@/components/Editor/EditorContainer";
import Toolbar from "@/components/Toolbar/Toolbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import StatusBar from "@/components/StatusBar/StatusBar";
import ExportModal from "@/components/Modal/ExportModal";
import TableInsertModal from "@/components/Modal/TableInsertModal";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFileStore } from "@/store/fileStore";
import { useEditorStore } from "@/store/editorStore";
import { useThemeStore } from "@/store/themeStore";
import { tauriService } from "@/services/tauriService";
import { useFileOperations } from "@/hooks/useFileOperations";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

/**
 * Root application component.
 * Wires up global concerns: theme, keyboard shortcuts, window title, and layout.
 */
export default function App() {
  useTheme();
  useKeyboardShortcuts();

  const { currentFile, isDirty } = useFileStore();
  const { isSidebarOpen, isExportModalOpen, isTableModalOpen, setMode } = useEditorStore();
  const { customBgColor } = useThemeStore();
  const { openFilePath } = useFileOperations();

  // Handle OS file launching (e.g. "Open With" Whisper Page) and drag-drop
  useEffect(() => {
    let unlistenDrop: (() => void) | undefined;

    async function checkFileEvents() {
      try {
        // 1. Check for args on launch (ignoring macOS -psn flags or node paths)
        const args: string[] = await invoke("get_launch_args");
        if (args.length > 1) {
          const fileToOpen = args.find(
            (arg) =>
              (arg.toLowerCase().endsWith(".md") ||
                arg.toLowerCase().endsWith(".markdown")) &&
              !arg.startsWith("--")
          );
          if (fileToOpen) {
            const didOpen = await openFilePath(fileToOpen);
            if (didOpen) {
              setMode("read-only");
            }
          }
        }

        // 2. Listen for drag & drop
        const unlisten = await listen<{ paths: string[] }>("tauri://file-drop", (event) => {
          const payload = event.payload;
          if (Array.isArray(payload.paths)) {
            const firstPath = payload.paths[0];
            if (firstPath) {
              openFilePath(firstPath)
                .then((didOpen) => {
                  if (didOpen) {
                    setMode("read-only");
                  }
                })
                .catch((err: unknown) => {
                  console.error("Failed to open dropped file:", err);
                });
            }
          }
        });
        unlistenDrop = unlisten;
      } catch (err) {
        console.error("Failed to check file events:", err);
      }
    }
    void checkFileEvents();

    return () => {
      if (unlistenDrop) unlistenDrop();
    };
  }, [openFilePath, setMode]);

  // Warn before closing/reloading when there are unsaved changes.
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;

      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Keep the OS window title in sync with current file state
  useEffect(() => {
    const fileName = currentFile
      ? currentFile.split("/").pop() ?? currentFile.split("\\").pop() ?? "Untitled"
      : "Untitled";
    const prefix = isDirty ? "• " : "";
    void tauriService.setWindowTitle(`${prefix}${fileName} — Whisper Page`);
  }, [currentFile, isDirty]);

  return (
    <div
      className="app-shell"
      style={customBgColor ? { background: customBgColor, backgroundImage: "none" } : undefined}
    >
      <div className="editor-area overflow-visible border-none bg-transparent shadow-none backdrop-blur-0">
        {isSidebarOpen && <Sidebar />}
        <div className="flex flex-col flex-1 min-w-0 h-full gap-2 overflow-hidden">
          <Toolbar />
          <div className="flex-1 min-h-0 overflow-hidden bg-[var(--color-surface)] backdrop-blur-3xl rounded-[28px] border border-[var(--color-border)] shadow-xl relative flex flex-col">
            <EditorContainer />
          </div>
        </div>
      </div>

      <StatusBar />

      {isExportModalOpen && <ExportModal />}
      {isTableModalOpen && <TableInsertModal />}
    </div>
  );
}
