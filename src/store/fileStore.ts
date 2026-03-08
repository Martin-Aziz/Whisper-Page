import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentFile {
  path: string;
  name: string;
  /** Unix timestamp (seconds) */
  lastOpened: number;
}

export interface FolderFile {
  name: string;
  path: string;
}

export interface FileState {
  /** Absolute path to the currently open file, or null for untitled */
  currentFile: string | null;
  /** Absolute path to the currently open folder, or null */
  currentFolder: string | null;
  /** List of markdown files in the current folder */
  folderFiles: FolderFile[];
  /** Whether the in-memory content differs from the saved file */
  isDirty: boolean;
  /** Last save timestamp (Date.now()) */
  lastSavedAt: number | null;
  /** Recently opened files (max 20, most recent first) */
  recentFiles: RecentFile[];

  // ── Actions ─────────────────────────────────────────────────
  setCurrentFile: (path: string | null) => void;
  setFolder: (folderPath: string | null, files: FolderFile[]) => void;
  setDirty: (dirty: boolean) => void;
  recordSave: () => void;
  addRecentFile: (file: RecentFile) => void;
  removeRecentFile: (path: string) => void;
  clearRecentFiles: () => void;
}

const MAX_RECENT_FILES = 20;

/**
 * File state store — tracks which file is open and recent file history.
 * Persists recent files across sessions via localStorage.
 */
export const useFileStore = create<FileState>()(
  persist(
    (set) => ({
      currentFile: null,
      currentFolder: null,
      folderFiles: [],
      isDirty: false,
      lastSavedAt: null,
      recentFiles: [],

      setCurrentFile: (currentFile) =>
        set({ currentFile, isDirty: false }),

      setFolder: (currentFolder, folderFiles) =>
        set({ currentFolder, folderFiles }),

      setDirty: (isDirty) => set({ isDirty }),

      recordSave: () => set({ isDirty: false, lastSavedAt: Date.now() }),

      addRecentFile: (file) =>
        set((state) => {
          const filtered = state.recentFiles.filter(
            (f) => f.path !== file.path
          );
          return {
            recentFiles: [file, ...filtered].slice(0, MAX_RECENT_FILES),
          };
        }),

      removeRecentFile: (path) =>
        set((state) => ({
          recentFiles: state.recentFiles.filter((f) => f.path !== path),
        })),

      clearRecentFiles: () => set({ recentFiles: [] }),
    }),
    {
      name: "whisper-page-file-state",
      partialize: (state) => ({
        recentFiles: state.recentFiles,
      }),
    }
  )
);
