import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileOperations } from "@/hooks/useFileOperations";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";
import { tauriService } from "@/services/tauriService";

vi.mock("@/services/tauriService", () => ({
    tauriService: {
        openFilePicker: vi.fn(),
        openFolderPicker: vi.fn(),
        readDirectory: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        saveFilePicker: vi.fn(),
    },
}));

describe("useFileOperations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useEditorStore.setState({ markdownContent: "", mode: "wysiwyg" });
        useFileStore.setState({ currentFile: null, folderFiles: [], recentFiles: [], isDirty: false });
    });

    describe("openFile", () => {
        it("sets mode to source when opening an .html file", async () => {
            vi.mocked(tauriService.openFilePicker).mockResolvedValue("/path/to/notes.html");
            vi.mocked(tauriService.readFile).mockResolvedValue("<h1>Hello</h1>");

            const { result } = renderHook(() => useFileOperations());

            await act(async () => {
                await result.current.openFile();
            });

            expect(useEditorStore.getState().mode).toBe("source");
            expect(useEditorStore.getState().markdownContent).toBe("<h1>Hello</h1>");
        });

        it("sets mode to read-only when opening a .md file", async () => {
            vi.mocked(tauriService.openFilePicker).mockResolvedValue("/path/to/notes.md");
            vi.mocked(tauriService.readFile).mockResolvedValue("# Hello");

            const { result } = renderHook(() => useFileOperations());

            await act(async () => {
                await result.current.openFile();
            });

            expect(useEditorStore.getState().mode).toBe("read-only");
        });
    });

    describe("saveFileAs", () => {
        it("uses .html extension if current file is an HTML file", async () => {
            useFileStore.setState({ currentFile: "/docs/page.html" });
            useEditorStore.setState({ markdownContent: "<h1>Title</h1>" });
            vi.mocked(tauriService.saveFilePicker).mockResolvedValue("/new/path.html");

            const { result } = renderHook(() => useFileOperations());

            await act(async () => {
                await result.current.saveFileAs();
            });

            expect(tauriService.saveFilePicker).toHaveBeenCalledWith("_h1_Title__h1_.html");
        });

        it("uses .md extension if current file is a MD file", async () => {
            useFileStore.setState({ currentFile: "/docs/page.md" });
            useEditorStore.setState({ markdownContent: "# Title" });
            vi.mocked(tauriService.saveFilePicker).mockResolvedValue("/new/path.md");

            const { result } = renderHook(() => useFileOperations());

            await act(async () => {
                await result.current.saveFileAs();
            });

            expect(tauriService.saveFilePicker).toHaveBeenCalledWith("Title.md");
        });
    });

    describe("openFolder", () => {
        it("filters and processes .html and .md files correctly from the directory", async () => {
            vi.mocked(tauriService.openFolderPicker).mockResolvedValue("/project/");
            vi.mocked(tauriService.readDirectory).mockResolvedValue([
                { name: "test.md", isDirectory: false, isSymlink: false, isFile: true },
                { name: "test.html", isDirectory: false, isSymlink: false, isFile: true },
                { name: "ignore.png", isDirectory: false, isSymlink: false, isFile: true },
            ]);

            const { result } = renderHook(() => useFileOperations());

            await act(async () => {
                await result.current.openFolder();
            });

            const folderFiles = useFileStore.getState().folderFiles;
            expect(folderFiles).toHaveLength(2);
            expect((folderFiles[0] || {}).name).toBe("test.html"); // Sorted alphabetically
            expect((folderFiles[1] || {}).name).toBe("test.md");
        });
    });
});
