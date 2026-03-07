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
import { tauriService } from "@/services/tauriService";

/**
 * Root application component.
 * Wires up global concerns: theme, keyboard shortcuts, window title, and layout.
 */
export default function App() {
  useTheme();
  useKeyboardShortcuts();

  const { currentFile, isDirty } = useFileStore();
  const { isSidebarOpen, isExportModalOpen, isTableModalOpen } = useEditorStore();

  // Keep the OS window title in sync with current file state
  useEffect(() => {
    const fileName = currentFile
      ? currentFile.split("/").pop() ?? "Untitled"
      : "Untitled";
    const prefix = isDirty ? "• " : "";
    tauriService.setWindowTitle(`${prefix}${fileName} — Lumina`);
  }, [currentFile, isDirty]);

  return (
    <div className="app-shell">
      <Toolbar />

      <div className="editor-area">
        {isSidebarOpen && <Sidebar />}
        <EditorContainer />
      </div>

      <StatusBar />

      {isExportModalOpen && <ExportModal />}
      {isTableModalOpen && <TableInsertModal />}
    </div>
  );
}
