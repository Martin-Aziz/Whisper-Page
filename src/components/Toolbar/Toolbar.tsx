import { PanelLeft } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import Button from "@/components/common/Button";
import Tooltip from "@/components/common/Tooltip";
import { cn } from "@/utils/cn";
import { Separator } from "./Separator";

import { FileActions } from "./FileActions";
import { FormatActions } from "./FormatActions";
import { ModeToggles } from "./ModeToggles";
import { ThemeSettings } from "./ThemeSettings";

/**
 * Application toolbar orchestrator.
 * Combines cohesive sub-components into the main floating toolbar.
 *
 * @layer Component
 */
export default function Toolbar() {
  const { isFocusMode, toggleSidebar, isSidebarOpen } = useEditorStore();

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

      <FileActions />

      <Separator />

      <FormatActions />

      {/* Spacer */}
      <div className="flex-1" />

      <ModeToggles />

      <Separator />

      <ThemeSettings />
    </header>
  );
}
