import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Link,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Table,
    Image,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEditorStore, type FormatCommand } from "@/store/editorStore";
import Tooltip from "@/components/common/Tooltip";
import Button from "@/components/common/Button";
import { Separator } from "./Separator";

export function FormatActions() {
    const {
        openTableModal,
        runFormatCommand,
        mode,
        canRunFormatCommand,
    } = useEditorStore();

    const richTextCommandsEnabled = mode === "wysiwyg" && canRunFormatCommand;
    const editingDisabledReason = mode === "read-only"
        ? "Unavailable in read-only mode"
        : "Rich Text mode only";

    function renderFormatButton(
        label: string,
        command: FormatCommand,
        icon: ReactNode,
        shortcut?: string
    ) {
        const tooltipShortcut = richTextCommandsEnabled ? shortcut : undefined;

        return (
            <Tooltip
                content={richTextCommandsEnabled ? label : `${label} (${editingDisabledReason})`}
                {...(tooltipShortcut ? { shortcut: tooltipShortcut } : {})}
            >
                <Button
                    className="cute-bounce"
                    variant="ghost"
                    size="sm"
                    aria-label={label}
                    disabled={!richTextCommandsEnabled}
                    onClick={() => {
                        runFormatCommand(command);
                    }}
                >
                    {icon}
                </Button>
            </Tooltip>
        );
    }

    return (
        <>
            {renderFormatButton("Bold", "bold", <Bold size={15} />, "⌘B")}
            {renderFormatButton("Italic", "italic", <Italic size={15} />, "⌘I")}
            {renderFormatButton("Strikethrough", "strike", <Strikethrough size={15} />)}
            {renderFormatButton("Inline code", "code", <Code size={15} />)}

            <Tooltip content="Insert link (Coming soon)">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Link" disabled>
                    <Link size={15} />
                </Button>
            </Tooltip>

            <Separator />

            {renderFormatButton("Heading 1", "h1", <Heading1 size={15} />)}
            {renderFormatButton("Heading 2", "h2", <Heading2 size={15} />)}
            {renderFormatButton("Heading 3", "h3", <Heading3 size={15} />)}

            <Separator />

            {renderFormatButton("Bullet list", "bulletList", <List size={15} />)}
            {renderFormatButton("Numbered list", "orderedList", <ListOrdered size={15} />)}
            {renderFormatButton("Task list", "taskList", <CheckSquare size={15} />)}
            {renderFormatButton("Blockquote", "blockquote", <Quote size={15} />)}

            <Tooltip
                content={mode === "read-only" ? "Insert table (Unavailable in read-only mode)" : "Insert table"}
                {...(mode === "read-only" ? {} : { shortcut: "⌘T" })}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="cute-bounce"
                    onClick={openTableModal}
                    aria-label="Insert table"
                    disabled={mode === "read-only"}
                >
                    <Table size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Insert image (Coming soon)">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Insert image" disabled>
                    <Image size={15} />
                </Button>
            </Tooltip>
        </>
    );
}
