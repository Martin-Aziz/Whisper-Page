import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { open as dialogOpen, save as dialogSave } from "@tauri-apps/plugin-dialog";
import { tauriService } from "@/services/tauriService";

const mockInvoke = vi.mocked(invoke);
const mockOpen = vi.mocked(dialogOpen);
const mockSave = vi.mocked(dialogSave);

describe("tauriService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("openFilePicker", () => {
    it("returns selected file path as string", async () => {
      mockOpen.mockResolvedValue("/home/user/notes.md");
      const result = await tauriService.openFilePicker();
      expect(result).toBe("/home/user/notes.md");
      expect(mockOpen).toHaveBeenCalledWith({
        multiple: false,
        filters: expect.arrayContaining([
          expect.objectContaining({ name: "Markdown" }),
        ]),
      });
    });

    it("returns null when user cancels the dialog", async () => {
      mockOpen.mockResolvedValue(null);
      const result = await tauriService.openFilePicker();
      expect(result).toBeNull();
    });

    it("returns null when dialog returns an array", async () => {
      // dialogOpen with multiple:false should never return an array, but guard anyway
      mockOpen.mockResolvedValue(["/path/one.md", "/path/two.md"]);
      const result = await tauriService.openFilePicker();
      expect(result).toBeNull();
    });
  });

  describe("saveFilePicker", () => {
    it("returns chosen path", async () => {
      mockSave.mockResolvedValue("/home/user/output.md");
      const result = await tauriService.saveFilePicker("output.md");
      expect(result).toBe("/home/user/output.md");
    });

    it("uses default name when no argument provided", async () => {
      mockSave.mockResolvedValue(null);
      await tauriService.saveFilePicker();
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ defaultPath: "Untitled.md" })
      );
    });

    it("returns null when user cancels", async () => {
      mockSave.mockResolvedValue(null);
      const result = await tauriService.saveFilePicker();
      expect(result).toBeNull();
    });
  });

  describe("savePdfPicker", () => {
    it("returns chosen PDF path", async () => {
      mockSave.mockResolvedValue("/home/user/document.pdf");
      const result = await tauriService.savePdfPicker("document.pdf");
      expect(result).toBe("/home/user/document.pdf");
    });

    it("filters for PDF extension", async () => {
      mockSave.mockResolvedValue(null);
      await tauriService.savePdfPicker("doc.pdf");
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({ name: "PDF Document" }),
          ]),
        })
      );
    });
  });

  describe("readFile", () => {
    it("invokes read_file command and returns content", async () => {
      mockInvoke.mockResolvedValue("# Hello\n\nContent here.");
      const result = await tauriService.readFile("/path/to/file.md");
      expect(result).toBe("# Hello\n\nContent here.");
      expect(mockInvoke).toHaveBeenCalledWith("read_file", {
        path: "/path/to/file.md",
      });
    });

    it("propagates errors from the backend", async () => {
      mockInvoke.mockRejectedValue(new Error("File not found"));
      await expect(tauriService.readFile("/nonexistent.md")).rejects.toThrow(
        "File not found"
      );
    });
  });

  describe("writeFile", () => {
    it("invokes write_file with path and content", async () => {
      mockInvoke.mockResolvedValue(undefined);
      await tauriService.writeFile("/path/file.md", "# Content");
      expect(mockInvoke).toHaveBeenCalledWith("write_file", {
        path: "/path/file.md",
        content: "# Content",
      });
    });

    it("propagates write errors", async () => {
      mockInvoke.mockRejectedValue(new Error("Permission denied"));
      await expect(
        tauriService.writeFile("/readonly.md", "content")
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("fileExists", () => {
    it("returns true when file exists", async () => {
      mockInvoke.mockResolvedValue(true);
      const result = await tauriService.fileExists("/path/file.md");
      expect(result).toBe(true);
    });

    it("returns false when file does not exist", async () => {
      mockInvoke.mockResolvedValue(false);
      const result = await tauriService.fileExists("/nonexistent.md");
      expect(result).toBe(false);
    });
  });

  describe("getFileMetadata", () => {
    it("returns file metadata from backend", async () => {
      const meta = {
        path: "/docs/file.md",
        name: "file.md",
        size: 1024,
        modified: 1700000000,
        isReadonly: false,
      };
      mockInvoke.mockResolvedValue(meta);
      const result = await tauriService.getFileMetadata("/docs/file.md");
      expect(result).toEqual(meta);
    });
  });

  describe("toggleFullscreen", () => {
    it("invokes toggle_fullscreen command", async () => {
      mockInvoke.mockResolvedValue(undefined);
      await tauriService.toggleFullscreen();
      expect(mockInvoke).toHaveBeenCalledWith("toggle_fullscreen");
    });
  });

  describe("setWindowTitle", () => {
    it("does nothing when not running in Tauri (no __TAURI__ on window)", async () => {
      // window.__TAURI__ is undefined in test env (set in setup.ts)
      await tauriService.setWindowTitle("Test — Lumina");
      // invoke should NOT be called since we're not in a Tauri context
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });
});
