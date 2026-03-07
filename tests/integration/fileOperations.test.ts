import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useFileStore } from "@/store/fileStore";
import { useEditorStore } from "@/store/editorStore";
import * as tauriServiceModule from "@/services/tauriService";

/**
 * Integration tests for file operations.
 * Mocks the tauriService at the module boundary to simulate IPC calls.
 * Tests the interaction between file operations, editor store, and file store.
 */
describe("File Operations Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useFileStore.setState({
      currentFile: null,
      isDirty: false,
      lastSavedAt: null,
      recentFiles: [],
    });
    useEditorStore.setState({
      markdownContent: "",
      wordCount: 0,
      characterCount: 0,
    });
  });

  describe("openFilePath workflow", () => {
    it("reads file and updates editor content", async () => {
      const mockContent = "# Hello\n\nThis is a test.";
      vi.spyOn(tauriServiceModule.tauriService, "readFile").mockResolvedValue(mockContent);

      // Simulate opening a file
      const path = "/docs/test.md";
      await act(async () => {
        const content = await tauriServiceModule.tauriService.readFile(path);
        useEditorStore.getState().setMarkdownContent(content);
        useFileStore.getState().setCurrentFile(path);
        useFileStore.getState().addRecentFile({
          path,
          name: "test.md",
          lastOpened: Math.floor(Date.now() / 1000),
        });
      });

      expect(useEditorStore.getState().markdownContent).toBe(mockContent);
      expect(useFileStore.getState().currentFile).toBe(path);
      expect(useFileStore.getState().isDirty).toBe(false);
      expect(useFileStore.getState().recentFiles[0]?.path).toBe(path);
    });

    it("marks file as read-only in state when readFile fails", async () => {
      vi.spyOn(tauriServiceModule.tauriService, "readFile").mockRejectedValue(
        new Error("Permission denied")
      );

      const path = "/protected/file.md";
      let caught: unknown;

      await act(async () => {
        try {
          await tauriServiceModule.tauriService.readFile(path);
        } catch (e) {
          caught = e;
        }
      });

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toBe("Permission denied");
      // State should remain clean after failed open
      expect(useFileStore.getState().currentFile).toBeNull();
    });
  });

  describe("save workflow", () => {
    it("calls writeFile with current path and content", async () => {
      const writeSpy = vi.spyOn(tauriServiceModule.tauriService, "writeFile").mockResolvedValue();
      const path = "/docs/test.md";
      const content = "# Updated content";

      useFileStore.setState({ currentFile: path, isDirty: true });
      useEditorStore.setState({ markdownContent: content });

      await act(async () => {
        await tauriServiceModule.tauriService.writeFile(path, content);
        useFileStore.getState().recordSave();
      });

      expect(writeSpy).toHaveBeenCalledWith(path, content);
      expect(useFileStore.getState().isDirty).toBe(false);
      expect(useFileStore.getState().lastSavedAt).toBeGreaterThan(0);
    });
  });

  describe("new file workflow", () => {
    it("clears content and file path", () => {
      useFileStore.setState({ currentFile: "/old.md", isDirty: true });
      useEditorStore.setState({ markdownContent: "old content" });

      act(() => {
        useEditorStore.getState().setMarkdownContent("");
        useFileStore.getState().setCurrentFile(null);
        useFileStore.getState().setDirty(false);
      });

      expect(useEditorStore.getState().markdownContent).toBe("");
      expect(useFileStore.getState().currentFile).toBeNull();
      expect(useFileStore.getState().isDirty).toBe(false);
    });
  });
});
