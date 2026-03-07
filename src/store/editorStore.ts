import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Editor mode determines which editing engine is active. */
export type EditorMode = "wysiwyg" | "source" | "read-only";

/** Which panel is splitting the view in source mode. */
export type SplitMode = "off" | "preview-right";

export interface EditorState {
  // ── Mode ────────────────────────────────────────────────────
  mode: EditorMode;
  splitMode: SplitMode;
  isFocusMode: boolean;

  // ── UI Layout ───────────────────────────────────────────────
  isSidebarOpen: boolean;
  isExportModalOpen: boolean;
  isTableModalOpen: boolean;

  // ── Content ─────────────────────────────────────────────────
  /** Raw markdown string (source of truth shared between modes) */
  markdownContent: string;
  /** Word and character counts updated after each edit */
  wordCount: number;
  characterCount: number;
  /** Cursor position in source mode */
  cursorLine: number;
  cursorColumn: number;

  // ── Actions ─────────────────────────────────────────────────
  setMode: (mode: EditorMode) => void;
  setSplitMode: (mode: SplitMode) => void;
  setFocusMode: (active: boolean) => void;
  toggleSidebar: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  openTableModal: () => void;
  closeTableModal: () => void;
  setMarkdownContent: (content: string) => void;
  setCursorPosition: (line: number, column: number) => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Editor UI and content store.
 * Persists mode preferences across sessions.
 *
 * @example
 * const { mode, setMode } = useEditorStore();
 */
export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      mode: "wysiwyg",
      splitMode: "off",
      isFocusMode: false,
      isSidebarOpen: false,
      isExportModalOpen: false,
      isTableModalOpen: false,
      markdownContent: "",
      wordCount: 0,
      characterCount: 0,
      cursorLine: 1,
      cursorColumn: 1,

      setMode: (mode) => set({ mode }),
      setSplitMode: (splitMode) => set({ splitMode }),
      setFocusMode: (isFocusMode) => set({ isFocusMode }),
      toggleSidebar: () =>
        set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      openExportModal: () => set({ isExportModalOpen: true, isTableModalOpen: false }),
      closeExportModal: () => set({ isExportModalOpen: false }),
      openTableModal: () => set({ isTableModalOpen: true, isExportModalOpen: false }),
      closeTableModal: () => set({ isTableModalOpen: false }),

      setMarkdownContent: (content) =>
        set({
          markdownContent: content,
          wordCount: countWords(content),
          characterCount: content.length,
        }),

      setCursorPosition: (cursorLine, cursorColumn) =>
        set({ cursorLine, cursorColumn }),
    }),
    {
      name: "lumina-editor-prefs",
      partialize: (state) => ({
        mode: state.mode,
        splitMode: state.splitMode,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
