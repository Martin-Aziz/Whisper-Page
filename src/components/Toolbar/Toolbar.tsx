import { useRef } from "react";
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
  FileText,
  Monitor,
  Split,
  Focus,
  Sun,
  Moon,
  Laptop,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Palette,
  RotateCcw,
  PanelLeft,
  FolderPlus,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useThemeStore, type ThemeMode } from "@/store/themeStore";
import { useFileOperations } from "@/hooks/useFileOperations";
import Button from "@/components/common/Button";
import Tooltip from "@/components/common/Tooltip";
import { cn } from "@/utils/cn";

/**
 * Application toolbar.
 * Renders file operations, formatting actions, mode toggles, and theme picker.
 *
 * Formatting actions only apply when the Rich Text editor is active;
 * in source mode the buttons are visually present but formatting is
 * applied via markdown syntax directly.
 *
 * @layer Component
 */
export default function Toolbar() {
  const {
    mode,
    setMode,
    splitMode,
    setSplitMode,
    isFocusMode,
    setFocusMode,
    openExportModal,
    openTableModal,
    toggleSidebar,
    isSidebarOpen,
  } = useEditorStore();
  const { theme, setTheme, customBgColor, setCustomBgColor } = useThemeStore();
  const { newFile, openFile, openFolder, saveFile } = useFileOperations();

  const colorInputRef = useRef<HTMLInputElement>(null);
  const themeIcons: Record<ThemeMode, React.ReactNode> = {
    light: <Sun size={15} />,
    dark: <Moon size={15} />,
    system: <Laptop size={15} />,
  };

  const themeOrder: ThemeMode[] = ["light", "dark", "system"];
  const nextTheme = () => {
    const idx = themeOrder.indexOf(theme);
    setTheme(themeOrder[(idx + 1) % themeOrder.length] ?? "system");
  };

  return (
    <header
      className={cn(
        "flex items-center gap-0.5 px-2 shrink-0 shadow-sm",
        "border border-[var(--color-border)] rounded-full",
        "bg-[var(--color-surface-elevated)]/80 backdrop-blur-md",
        "h-[40px] px-3",
        "relative z-[100] overflow-visible",
        "w-full max-w-[900px] mx-auto",
        isFocusMode && "opacity-0 pointer-events-none"
      )}
      aria-label="Editor toolbar"
    >
      <Tooltip content="Toggle Sidebar" shortcut="⌘\">
        <Button
          className="cute-bounce"
          variant="ghost"
          size="sm"
          isActive={isSidebarOpen}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          aria-pressed={isSidebarOpen}
        >
          <PanelLeft size={16} />
        </Button>
      </Tooltip>

      <Separator />

      {/* File operations */}
      <Tooltip content="New file" shortcut="⌘N">
        <Button className="cute-bounce" variant="ghost" size="sm" onClick={newFile} aria-label="New file">
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

      <Separator />

      {/* Formatting (Rich Text context) */}
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

      {/* Headings */}
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

      {/* Lists */}
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mode toggles */}
      <Tooltip content="Rich Text mode" shortcut="⌘E">
        <Button
          className="cute-bounce"
          variant="ghost"
          size="sm"
          isActive={mode === "wysiwyg"}
          onClick={() => { setMode("wysiwyg"); }}
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

      {/* Export */}
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

      {/* Theme toggle */}
      <Tooltip content={`Theme: ${theme}`}>
        <Button
          className="cute-bounce"
          variant="ghost"
          size="sm"
          onClick={nextTheme}
          aria-label={`Current theme: ${theme}. Click to cycle.`}
        >
          {themeIcons[theme]}
        </Button>
      </Tooltip>

      <div className="flex items-center gap-1 pl-1 border-l border-[var(--color-border)] ml-1">
        <Tooltip content="Custom Background">
          <Button
            className="cute-bounce"
            variant="ghost"
            size="sm"
            onClick={() => colorInputRef.current?.click()}
            aria-label="Custom Background Color"
          >
            <Palette size={15} className={cn(customBgColor && "text-[var(--color-accent)]")} />
          </Button>
        </Tooltip>

        {customBgColor && (
          <Tooltip content="Reset Background">
            <Button
              className="cute-bounce"
              variant="ghost"
              size="sm"
              onClick={() => { setCustomBgColor(null); }}
              aria-label="Reset Background Color"
            >
              <RotateCcw size={13} />
            </Button>
          </Tooltip>
        )}

        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          value={customBgColor ?? "#ffffff"}
          onChange={(e) => { setCustomBgColor(e.target.value); }}
        />
      </div>
    </header>
  );
}

function Separator() {
  return (
    <div
      className="w-px h-5 bg-[var(--color-border)] mx-1"
      aria-hidden="true"
    />
  );
}
