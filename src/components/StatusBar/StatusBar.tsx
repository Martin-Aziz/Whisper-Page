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
        "flex items-center justify-between gap-4 px-4",
        "bg-[var(--color-surface-elevated)]/50 backdrop-blur-sm",
        "text-[var(--color-text-secondary)] text-xs font-medium",
        "min-h-[var(--statusbar-height)] py-1.5",
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

        <span className="bg-[var(--color-surface-overlay)]/40 px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)] shadow-sm">
          {wordCount.toLocaleString()} words
        </span>
        <span className="bg-[var(--color-surface-overlay)]/40 px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)] shadow-sm">
          {characterCount.toLocaleString()} chars
        </span>
        <span className="hidden sm:inline bg-[var(--color-surface-overlay)]/40 px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)] shadow-sm">
          {readingTime}
        </span>

        <span
          className={cn(
            "px-1.5 py-0.5 rounded font-medium text-[10px] uppercase tracking-wide",
            mode === "wysiwyg"
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]"
          )}
          aria-label={`Editor mode: ${mode === "wysiwyg" ? "Rich Text" : mode}`}
        >
          {mode === "wysiwyg" ? "Rich Text" : "Source"}
        </span>
      </div>
    </footer>
  );
}

function formatSavedAgo(timestamp: number): string {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSeconds < 5) return "just now";
  if (diffSeconds < 60) return String(diffSeconds) + "s ago";
  const diffMins = Math.floor(diffSeconds / 60);
  if (diffMins < 60) return String(diffMins) + "m ago";
  return String(Math.floor(diffMins / 60)) + "h ago";
}
