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
import { useEditorStore } from "@/store/editorStore";
import Tooltip from "@/components/common/Tooltip";
import Button from "@/components/common/Button";
import { Separator } from "./ToolbarSeparator";

export function FormatActions() {
    const { openTableModal } = useEditorStore();

    return (
        <>
            <Tooltip content="Bold" shortcut="⌘B">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Bold">
                    <Bold size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Italic" shortcut="⌘I">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Italic">
                    <Italic size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Strikethrough">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Strikethrough">
                    <Strikethrough size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Inline code">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Code">
                    <Code size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Insert link">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Link">
                    <Link size={15} />
                </Button>
            </Tooltip>

            <Separator />

            <Tooltip content="Heading 1">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Heading 1">
                    <Heading1 size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Heading 2">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Heading 2">
                    <Heading2 size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Heading 3">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Heading 3">
                    <Heading3 size={15} />
                </Button>
            </Tooltip>

            <Separator />

            <Tooltip content="Bullet list">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Bullet list">
                    <List size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Numbered list">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Numbered list">
                    <ListOrdered size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Task list">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Task list">
                    <CheckSquare size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Blockquote">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Blockquote">
                    <Quote size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Insert table" shortcut="⌘T">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={openTableModal}
                    aria-label="Insert table"
                >
                    <Table size={15} />
                </Button>
            </Tooltip>

            <Tooltip content="Insert image">
                <Button className="cute-bounce" variant="ghost" size="sm" aria-label="Insert image">
                    <Image size={15} />
                </Button>
            </Tooltip>
        </>
    );
}
