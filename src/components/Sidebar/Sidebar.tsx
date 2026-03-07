import { FileText, Trash2, Folder, X } from "lucide-react";
import { useFileStore } from "@/store/fileStore";
import { useFileOperations } from "@/hooks/useFileOperations";
import Button from "@/components/common/Button";
import Tooltip from "@/components/common/Tooltip";
import { cn } from "@/utils/cn";

/**
 * Sidebar panel showing recent files and providing quick-open access.
 * Toggled by Cmd/Ctrl+\ keyboard shortcut or the sidebar button in the toolbar.
 *
 * @layer Component
 */
export default function Sidebar() {
  const { recentFiles, currentFile, currentFolder, folderFiles } = useFileStore();
  const { openFilePath } = useFileOperations();

  function formatRelativeTime(unixSeconds: number): string {
    const diffMs = Date.now() - unixSeconds * 1000;
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return String(diffMins) + "m ago";
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return String(diffHours) + "h ago";
    return String(Math.floor(diffHours / 24)) + "d ago";
  }

  return (
    <aside
      className={cn(
        "sidebar flex flex-col",
        "w-[var(--sidebar-width)] shrink-0",
        "bg-[var(--color-surface-elevated)]",
        "border-r border-[var(--color-border)]",
        "overflow-visible z-10"
      )}
      aria-label="File sidebar"
    >
      {currentFolder && (
        <div className="flex flex-col flex-1 min-h-0 border-b border-[var(--color-border)]">
          <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
            <h2
              className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5 min-w-0"
              title={currentFolder}
            >
              <Folder size={12} className="shrink-0" />
              <span className="truncate">{currentFolder.split('/').pop() || currentFolder.split('\\').pop() || "Folder"}</span>
            </h2>
            <Tooltip content="Close Folder">
              <button onClick={() => useFileStore.getState().setFolder(null, [])} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                <X size={12} />
              </button>
            </Tooltip>
          </div>
          <ul className="overflow-y-auto py-1 custom-scrollbar" role="list">
            {folderFiles.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-[var(--color-text-muted)]">
                No markdown files
              </li>
            )}
            {folderFiles.map(file => {
              const isOpen = file.path === currentFile;
              const shortName = file.name.replace(/\.(md|markdown)$/i, "");
              return (
                <li key={file.path} className="group">
                  <button
                    onClick={() => void openFilePath(file.path)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-left",
                      "transition-colors duration-100",
                      "hover:bg-[var(--color-surface-overlay)]",
                      isOpen && "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                    )}
                    aria-current={isOpen ? "page" : undefined}
                  >
                    <FileText size={13} className="shrink-0 text-[var(--color-text-muted)]" />
                    <span className="text-sm font-medium truncate flex-1">{shortName}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className={cn(
        "flex flex-col flex-1 min-h-0",
        currentFolder && "max-h-[50%]"
      )}>
        <div className="px-3 py-2 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Recent Files
          </h2>
        </div>

        <ul className="flex-1 overflow-y-auto py-1 custom-scrollbar" role="list">
          {recentFiles.length === 0 && (
            <li className="px-3 py-8 text-center text-xs text-[var(--color-text-muted)]">
              No recent files
            </li>
          )}

          {recentFiles.map((file) => {
            const isOpen = file.path === currentFile;
            const shortName = file.name.replace(/\.(md|markdown)$/i, "");

            return (
              <li key={file.path} className="group">
                <button
                  onClick={() => void openFilePath(file.path)}
                  className={cn(
                    "w-full flex items-start gap-2 px-3 py-2 text-left",
                    "transition-colors duration-100",
                    "hover:bg-[var(--color-surface-overlay)]",
                    isOpen && "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  )}
                  aria-current={isOpen ? "page" : undefined}
                >
                  <FileText size={14} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{shortName}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {file.path.split("/").slice(-2, -1)[0] ?? ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 shrink-0">
                    {formatRelativeTime(file.lastOpened)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {recentFiles.length > 0 && (
          <div className="px-3 py-2 border-t border-[var(--color-border)] shrink-0">
            <Tooltip content="Clear Sidebar History">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-[var(--color-text-muted)]"
                onClick={() => { useFileStore.getState().clearRecentFiles(); }}
              >
                <Trash2 size={13} className="mr-1.5" />
                Clear history
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </aside >
  );
}
