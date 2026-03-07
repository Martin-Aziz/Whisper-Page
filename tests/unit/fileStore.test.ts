import { describe, it, expect, beforeEach } from "vitest";
import { useFileStore } from "@/store/fileStore";

/**
 * Tests for the file Zustand store.
 * Resets state before each test for isolation.
 */
describe("useFileStore", () => {
  beforeEach(() => {
    useFileStore.setState({
      currentFile: null,
      isDirty: false,
      lastSavedAt: null,
      recentFiles: [],
    });
  });

  describe("file state management", () => {
    it("starts with no current file", () => {
      expect(useFileStore.getState().currentFile).toBeNull();
    });

    it("sets current file and clears dirty flag", () => {
      useFileStore.getState().setDirty(true);
      useFileStore.getState().setCurrentFile("/path/to/file.md");

      const state = useFileStore.getState();
      expect(state.currentFile).toBe("/path/to/file.md");
      expect(state.isDirty).toBe(false);
    });

    it("allows setting current file to null (new file)", () => {
      useFileStore.getState().setCurrentFile("/path/file.md");
      useFileStore.getState().setCurrentFile(null);
      expect(useFileStore.getState().currentFile).toBeNull();
    });
  });

  describe("dirty state", () => {
    it("starts clean", () => {
      expect(useFileStore.getState().isDirty).toBe(false);
    });

    it("marks dirty when content changes", () => {
      useFileStore.getState().setDirty(true);
      expect(useFileStore.getState().isDirty).toBe(true);
    });

    it("recordSave clears dirty and sets lastSavedAt", () => {
      const before = Date.now();
      useFileStore.getState().setDirty(true);
      useFileStore.getState().recordSave();

      const state = useFileStore.getState();
      expect(state.isDirty).toBe(false);
      expect(state.lastSavedAt).toBeGreaterThanOrEqual(before);
      expect(state.lastSavedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("recent files", () => {
    const sampleFile = {
      path: "/docs/readme.md",
      name: "readme.md",
      lastOpened: 1_700_000_000,
    };

    it("starts with empty recent files list", () => {
      expect(useFileStore.getState().recentFiles).toHaveLength(0);
    });

    it("adds a file to recent files", () => {
      useFileStore.getState().addRecentFile(sampleFile);
      expect(useFileStore.getState().recentFiles).toHaveLength(1);
      expect(useFileStore.getState().recentFiles[0]).toEqual(sampleFile);
    });

    it("deduplicates files - same path moves to top", () => {
      const older = { ...sampleFile, lastOpened: 1_600_000_000 };
      const newer = { ...sampleFile, lastOpened: 1_700_000_000 };

      useFileStore.getState().addRecentFile(older);
      useFileStore.getState().addRecentFile(newer);

      const recent = useFileStore.getState().recentFiles;
      expect(recent).toHaveLength(1);
      expect(recent[0]?.lastOpened).toBe(1_700_000_000);
    });

    it("caps recent files at 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        useFileStore.getState().addRecentFile({
          path: "/file-" + String(i) + ".md",
          name: "file-" + String(i) + ".md",
          lastOpened: i,
        });
      }
      expect(useFileStore.getState().recentFiles).toHaveLength(20);
    });

    it("removes a specific file", () => {
      useFileStore.getState().addRecentFile(sampleFile);
      useFileStore.getState().removeRecentFile(sampleFile.path);
      expect(useFileStore.getState().recentFiles).toHaveLength(0);
    });

    it("ignores remove for non-existent path", () => {
      useFileStore.getState().addRecentFile(sampleFile);
      useFileStore.getState().removeRecentFile("/other/path.md");
      expect(useFileStore.getState().recentFiles).toHaveLength(1);
    });

    it("clears all recent files", () => {
      useFileStore.getState().addRecentFile(sampleFile);
      useFileStore.getState().clearRecentFiles();
      expect(useFileStore.getState().recentFiles).toHaveLength(0);
    });

    it("most recently added file appears first", () => {
      const fileA = { path: "/a.md", name: "a.md", lastOpened: 100 };
      const fileB = { path: "/b.md", name: "b.md", lastOpened: 200 };

      useFileStore.getState().addRecentFile(fileA);
      useFileStore.getState().addRecentFile(fileB);

      expect(useFileStore.getState().recentFiles[0]?.path).toBe("/b.md");
    });
  });
});
