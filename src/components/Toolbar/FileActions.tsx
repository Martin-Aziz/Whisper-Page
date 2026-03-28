import {
    FilePlus,
    FolderOpen,
    FolderPlus,
    Save,
} from "lucide-react";
import Tooltip from "@/components/common/Tooltip";
import Button from "@/components/common/Button";
import { useFileOperations } from "@/hooks/useFileOperations";

export function FileActions() {
    const { newFile, openFile, openFolder, saveFile } = useFileOperations();

    return (
        <>
            <Tooltip content="New file" shortcut="⌘N">
                <Button className="cute-bounce" variant="ghost" size="sm" onClick={() => void newFile()} aria-label="New file">
                    <FilePlus size={16} />
                </Button>
            </Tooltip>

            <Tooltip content="Open file" shortcut="⌘O">
                <Button className="cute-bounce" variant="ghost" size="sm" onClick={() => void openFile()} aria-label="Open file">
                    <FolderOpen size={16} />
                </Button>
            </Tooltip>

            <Tooltip content="Open folder" shortcut="⌘⇧O">
                <Button className="cute-bounce" variant="ghost" size="sm" onClick={() => void openFolder()} aria-label="Open folder">
                    <FolderPlus size={16} />
                </Button>
            </Tooltip>

            <Tooltip content="Save" shortcut="⌘S">
                <Button className="cute-bounce" variant="ghost" size="sm" onClick={() => void saveFile()} aria-label="Save">
                    <Save size={16} />
                </Button>
            </Tooltip>
        </>
    );
}
