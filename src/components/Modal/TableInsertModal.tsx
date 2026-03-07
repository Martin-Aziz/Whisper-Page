import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import Button from "@/components/common/Button";
import { cn } from "@/utils/cn";

/**
 * Modal for inserting a table with a chosen row/column count.
 * Triggered by Cmd/Ctrl+T or the table toolbar button.
 *
 * Inserts a GFM-style markdown table into the source store.
 *
 * @layer Component
 */
export default function TableInsertModal() {
  const { closeTableModal, setMarkdownContent, markdownContent } = useEditorStore();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Focus trap & ESC to close
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeTableModal();
  }

  function buildMarkdownTable(rows: number, cols: number): string {
    const headerCells = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`);
    const separators = Array.from({ length: cols }, () => "---");
    const bodyRow = Array.from({ length: cols }, () => " ");

    const header = `| ${headerCells.join(" | ")} |`;
    const separator = `| ${separators.join(" | ")} |`;
    const body = Array.from({ length: rows }, () => `| ${bodyRow.join(" | ")} |`).join("\n");

    return `\n${header}\n${separator}\n${body}\n`;
  }

  function handleInsert() {
    const tableMarkdown = buildMarkdownTable(rows, cols);
    setMarkdownContent(markdownContent + tableMarkdown);
    closeTableModal();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) closeTableModal(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        open
        className={cn(
          "relative z-10 w-full max-w-sm rounded-xl shadow-2xl outline-none",
          "bg-[var(--color-surface)] border border-[var(--color-border)]",
          "p-6 animate-slide-up"
        )}
        aria-labelledby="table-modal-title"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="table-modal-title" className="text-base font-semibold text-[var(--color-text-primary)]">
            Insert Table
          </h2>
          <Button variant="ghost" size="sm" onClick={closeTableModal} aria-label="Close">
            <X size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="table-rows"
              className="block mb-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Rows
            </label>
            <input
              id="table-rows"
              type="number"
              min={1}
              max={50}
              value={rows}
              onChange={(e) => setRows(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-sm",
                "bg-[var(--color-surface-elevated)] border border-[var(--color-border)]",
                "text-[var(--color-text-primary)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="table-cols"
              className="block mb-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Columns
            </label>
            <input
              id="table-cols"
              type="number"
              min={1}
              max={20}
              value={cols}
              onChange={(e) => setCols(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-sm",
                "bg-[var(--color-surface-elevated)] border border-[var(--color-border)]",
                "text-[var(--color-text-primary)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              )}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mb-5 p-3 rounded-lg bg-[var(--color-surface-elevated)] overflow-hidden">
          <TablePreview rows={Math.min(rows, 4)} cols={Math.min(cols, 5)} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="md" onClick={closeTableModal}>
            Cancel
          </Button>
          <Button variant="solid" size="md" onClick={handleInsert}>
            Insert Table
          </Button>
        </div>
      </dialog>
    </div>
  );
}

function TablePreview({ rows, cols }: { rows: number; cols: number }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, ci) => (
            <th
              key={ci}
              className="border border-[var(--color-border)] px-2 py-1 bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] font-medium"
            >
              Col {ci + 1}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, ri) => (
          <tr key={ri}>
            {Array.from({ length: cols }).map((_, ci) => (
              <td
                key={ci}
                className="border border-[var(--color-border)] px-2 py-1 text-[var(--color-text-muted)]"
              >
                &nbsp;
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
