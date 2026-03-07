import { useFileStore } from "@/store/fileStore";
import { useEditorStore } from "@/store/editorStore";
import { estimateReadingTime } from "@/services/markdownService";
import { cn } from "@/utils/cn";

/**
 * Status bar fixed at the bottom of the app window.
 * Displays: file path, dirty indicator, word count, reading time,
 * cursor position (source mode), and current editor mode.
 *
 * @layer Component
 */
export default function StatusBar() {
  const { currentFile, isDirty, lastSavedAt } = useFileStore();
  const {
    wordCount,
    characterCount,
    markdownContent,
    cursorLine,
    cursorColumn,
    mode,
    isFocusMode,
  } = useEditorStore();

  if (isFocusMode) return null;

  const fileName = currentFile
    ? currentFile.split("/").pop() ?? currentFile
    : "Untitled";

  const savedAgo = lastSavedAt
    ? formatSavedAgo(lastSavedAt)
    : null;

  const readingTime = estimateReadingTime(markdownContent);

  return (
    <footer
      className={cn(
        "flex items-center justify-between gap-4 px-3",
        "border-t border-[var(--color-border)]",
        "bg-[var(--color-surface-elevated)]",
        "text-[var(--color-text-muted)] text-xs",
        "h-[var(--statusbar-height)]",
        "select-none shrink-0"
      )}
      aria-label="Status bar"
    >
      {/* Left: file info */}
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "flex items-center gap-1.5 truncate",
            isDirty && "text-[var(--color-accent)]"
          )}
          title={currentFile ?? "Untitled (unsaved)"}
        >
          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" aria-label="Unsaved changes" />
          )}
          {fileName}
        </span>

        {savedAgo && !isDirty && (
          <span className="hidden sm:inline opacity-60">Saved {savedAgo}</span>
        )}
      </div>

      {/* Right: stats */}
      <div className="flex items-center gap-4 shrink-0">
        {mode === "source" && (
          <span>
            Ln {cursorLine}, Col {cursorColumn}
          </span>
        )}

        <span>{wordCount.toLocaleString()} words</span>
        <span>{characterCount.toLocaleString()} chars</span>
        <span className="hidden sm:inline">{readingTime}</span>

        <span
          className={cn(
            "px-1.5 py-0.5 rounded font-medium text-[10px] uppercase tracking-wide",
            mode === "wysiwyg"
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]"
          )}
          aria-label={`Editor mode: ${mode}`}
        >
          {mode === "wysiwyg" ? "WYSIWYG" : "Source"}
        </span>
      </div>
    </footer>
  );
}

function formatSavedAgo(timestamp: number): string {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSeconds < 5) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMins = Math.floor(diffSeconds / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${Math.floor(diffMins / 60)}h ago`;
}
