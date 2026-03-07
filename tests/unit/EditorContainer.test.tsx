import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditorContainer from "@/components/Editor/EditorContainer";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";
import * as markdownService from "@/services/markdownService";

vi.mock("@/components/Editor/WysiwygEditor", () => ({
    default: () => null
}));

vi.mock("@/components/Editor/SourceEditor", () => ({
    default: () => null
}));

vi.mock("@/services/markdownService", () => ({
    markdownToHtmlAsync: vi.fn(),
}));

describe("EditorContainer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("bypasses markdown conversion if file is an html file", () => {
        useFileStore.setState({ currentFile: "index.html" });
        useEditorStore.setState({ markdownContent: "<h1>Raw HTML</h1>", mode: "read-only" });

        render(<EditorContainer />);

        // Fast-path bypass is synchronous, so it renders immediately
        expect(screen.getByText("Raw HTML")).toBeInTheDocument();
        expect(markdownService.markdownToHtmlAsync).not.toHaveBeenCalled();
    });

    it("uses markdown conversion if file is markdown", () => {
        useFileStore.setState({ currentFile: "index.md" });
        useEditorStore.setState({ markdownContent: "# Raw MD", mode: "read-only" });
        vi.mocked(markdownService.markdownToHtmlAsync).mockResolvedValue("<h1>Raw MD</h1>");

        render(<EditorContainer />);

        expect(markdownService.markdownToHtmlAsync).toHaveBeenCalledWith("# Raw MD");
    });
});
