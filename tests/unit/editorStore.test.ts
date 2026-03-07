import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/store/editorStore";

/**
 * Tests for the editor Zustand store.
 * Each test resets the store to a clean initial state.
 */
describe("useEditorStore", () => {
  beforeEach(() => {
    useEditorStore.setState({
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
    });
  });

  describe("mode management", () => {
    it("starts in wysiwyg mode", () => {
      expect(useEditorStore.getState().mode).toBe("wysiwyg");
    });

    it("switches to source mode", () => {
      useEditorStore.getState().setMode("source");
      expect(useEditorStore.getState().mode).toBe("source");
    });

    it("switches back from source to wysiwyg", () => {
      useEditorStore.getState().setMode("source");
      useEditorStore.getState().setMode("wysiwyg");
      expect(useEditorStore.getState().mode).toBe("wysiwyg");
    });
  });

  describe("split mode", () => {
    it("starts with split mode off", () => {
      expect(useEditorStore.getState().splitMode).toBe("off");
    });

    it("enables preview-right split", () => {
      useEditorStore.getState().setSplitMode("preview-right");
      expect(useEditorStore.getState().splitMode).toBe("preview-right");
    });
  });

  describe("focus mode", () => {
    it("starts with focus mode disabled", () => {
      expect(useEditorStore.getState().isFocusMode).toBe(false);
    });

    it("enables focus mode", () => {
      useEditorStore.getState().setFocusMode(true);
      expect(useEditorStore.getState().isFocusMode).toBe(true);
    });

    it("disables focus mode", () => {
      useEditorStore.getState().setFocusMode(true);
      useEditorStore.getState().setFocusMode(false);
      expect(useEditorStore.getState().isFocusMode).toBe(false);
    });
  });

  describe("sidebar", () => {
    it("starts with sidebar closed", () => {
      expect(useEditorStore.getState().isSidebarOpen).toBe(false);
    });

    it("toggles sidebar open", () => {
      useEditorStore.getState().toggleSidebar();
      expect(useEditorStore.getState().isSidebarOpen).toBe(true);
    });

    it("toggles sidebar closed again", () => {
      useEditorStore.getState().toggleSidebar();
      useEditorStore.getState().toggleSidebar();
      expect(useEditorStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe("modal management", () => {
    it("opens and closes export modal", () => {
      useEditorStore.getState().openExportModal();
      expect(useEditorStore.getState().isExportModalOpen).toBe(true);
      useEditorStore.getState().closeExportModal();
      expect(useEditorStore.getState().isExportModalOpen).toBe(false);
    });

    it("opens and closes table modal", () => {
      useEditorStore.getState().openTableModal();
      expect(useEditorStore.getState().isTableModalOpen).toBe(true);
      useEditorStore.getState().closeTableModal();
      expect(useEditorStore.getState().isTableModalOpen).toBe(false);
    });
  });

  describe("markdown content + word counting", () => {
    it("starts with empty content", () => {
      expect(useEditorStore.getState().markdownContent).toBe("");
      expect(useEditorStore.getState().wordCount).toBe(0);
    });

    it("sets content and updates word count", () => {
      useEditorStore.getState().setMarkdownContent("Hello world");
      const state = useEditorStore.getState();
      expect(state.markdownContent).toBe("Hello world");
      expect(state.wordCount).toBe(2);
      expect(state.characterCount).toBe(11);
    });

    it("counts words in multi-paragraph markdown", () => {
      useEditorStore.getState().setMarkdownContent("# Title\n\nOne two three.");
      // Simple whitespace split counts "#" as a word too: "#", "Title", "One", "two", "three."
      expect(useEditorStore.getState().wordCount).toBe(5);
    });

    it("returns 0 words for whitespace-only content", () => {
      useEditorStore.getState().setMarkdownContent("   \n\n   ");
      expect(useEditorStore.getState().wordCount).toBe(0);
    });

    it("updates character count correctly", () => {
      useEditorStore.getState().setMarkdownContent("abc");
      expect(useEditorStore.getState().characterCount).toBe(3);
    });
  });

  describe("cursor position", () => {
    it("starts at line 1, column 1", () => {
      const { cursorLine, cursorColumn } = useEditorStore.getState();
      expect(cursorLine).toBe(1);
      expect(cursorColumn).toBe(1);
    });

    it("updates cursor position", () => {
      useEditorStore.getState().setCursorPosition(5, 12);
      const { cursorLine, cursorColumn } = useEditorStore.getState();
      expect(cursorLine).toBe(5);
      expect(cursorColumn).toBe(12);
    });
  });
});
