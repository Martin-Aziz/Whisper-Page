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
  const [rowsStr, setRowsStr] = useState("3");
  const [colsStr, setColsStr] = useState("3");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const parsedRows = parseInt(rowsStr, 10);
  const parsedCols = parseInt(colsStr, 10);
  const isValid = !isNaN(parsedRows) && parsedRows > 0 && !isNaN(parsedCols) && parsedCols > 0;

  // Focus trap & ESC to close
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeTableModal();
  }

  function buildMarkdownTable(rows: number, cols: number): string {
    const headerCells = Array.from({ length: cols }, (_, i) => "Column " + String(i + 1));
    const separators = Array.from({ length: cols }, () => "---");
    const bodyRow = Array.from({ length: cols }, () => " ");

    const header = `| ${headerCells.join(" | ")} |`;
    const separator = `| ${separators.join(" | ")} |`;
    const body = Array.from({ length: rows }, () => `| ${bodyRow.join(" | ")} |`).join("\n");

    return `\n${header}\n${separator}\n${body}\n`;
  }

  function handleInsert() {
    if (!isValid) return;
    const tableMarkdown = buildMarkdownTable(Math.min(parsedRows, 100), Math.min(parsedCols, 50));
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
              value={rowsStr}
              onChange={(e) => { setRowsStr(e.target.value); }}
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
              value={colsStr}
              onChange={(e) => { setColsStr(e.target.value); }}
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
          <TablePreview rows={isValid ? Math.min(parsedRows, 4) : 1} cols={isValid ? Math.min(parsedCols, 5) : 1} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="md" onClick={closeTableModal}>
            Cancel
          </Button>
          <Button variant="solid" size="md" onClick={handleInsert} disabled={!isValid}>
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
