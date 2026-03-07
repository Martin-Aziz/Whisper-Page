import { FileText, Monitor, Split, Focus, Download } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";
import Tooltip from "@/components/common/Tooltip";
import Button from "@/components/common/Button";
import { Separator } from "./Separator";

export function ModeToggles() {
    const { mode, setMode, splitMode, setSplitMode, isFocusMode, setFocusMode, openExportModal } = useEditorStore();
    const { currentFile } = useFileStore();
    const isHtmlFile = currentFile?.toLowerCase().endsWith(".html") || currentFile?.toLowerCase().endsWith(".htm");

    return (
        <>
            <Tooltip content={isHtmlFile ? "Rich Text not available for HTML" : "Rich Text mode"} shortcut={isHtmlFile ? "" : "⌘E"}>
                <Button
                    className="cute-bounce"
                    variant="ghost"
                    size="sm"
                    isActive={mode === "wysiwyg"}
                    disabled={isHtmlFile}
                    onClick={() => { if (!isHtmlFile) setMode("wysiwyg"); }}
                    aria-label="Rich Text mode"
                    aria-pressed={mode === "wysiwyg"}
                >
                    <FileText size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Source mode" shortcut="⌘E">
                <Button
                    className="cute-bounce"
                    variant="ghost"
                    size="sm"
                    isActive={mode === "source" && splitMode === "off"}
                    onClick={() => { setMode("source"); setSplitMode("off"); }}
                    aria-label="Source mode"
                    aria-pressed={mode === "source" && splitMode === "off"}
                >
                    <Monitor size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Split preview">
                <Button
                    className="cute-bounce"
                    variant="ghost"
                    size="sm"
                    isActive={mode === "source" && splitMode === "preview-right"}
                    onClick={() => { setMode("source"); setSplitMode("preview-right"); }}
                    aria-label="Split preview"
                    aria-pressed={mode === "source" && splitMode === "preview-right"}
                >
                    <Split size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Focus mode" shortcut="⌘⇧F">
                <Button
                    className="cute-bounce"
                    variant="ghost"
                    size="sm"
                    isActive={isFocusMode}
                    onClick={() => { setFocusMode(!isFocusMode); }}
                    aria-label="Focus mode"
                    aria-pressed={isFocusMode}
                >
                    <Focus size={15} />
                </Button>
            </Tooltip>

            <Separator />

            <Tooltip content="Export PDF" shortcut="⌘P">
                <Button
                    className="cute-bounce"
                    variant="ghost"
                    size="sm"
                    onClick={openExportModal}
                    aria-label="Export to PDF"
                >
                    <Download size={15} />
                </Button>
            </Tooltip>
        </>
    );
}
