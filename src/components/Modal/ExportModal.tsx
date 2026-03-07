import { useState, useRef, useEffect } from "react";
import { X, FileDown, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";
import { tauriService } from "@/services/tauriService";
import { markdownToHtmlAsync } from "@/services/markdownService";
import Button from "@/components/common/Button";
import { cn } from "@/utils/cn";

type PageSize = "A4" | "Letter" | "Legal";
type ExportStatus = "idle" | "exporting" | "success" | "error";

/**
 * PDF export modal.
 * Lets the user choose page size, margins, and page numbers before exporting.
 * Communicates with the Rust backend via tauriService.exportToPdf().
 *
 * @security The HTML passed to the backend is DOMPurify-sanitised before export.
 * @layer Component
 */
export default function ExportModal() {
  const { closeExportModal, markdownContent } = useEditorStore();
  const { currentFile } = useFileStore();

  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [marginMm, setMarginMm] = useState(20);
  const [includePageNumbers, setIncludePageNumbers] = useState(false);
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && status !== "exporting") closeExportModal();
  }

  async function handleExport() {
    const isHtml = currentFile?.toLowerCase().endsWith(".html") || currentFile?.toLowerCase().endsWith(".htm");

    // For HTML files, we use the browser's native print-to-pdf dialog for 100% accurate CSS rendering
    if (isHtml) {
      const iframe = document.getElementById("html-preview-frame") as HTMLIFrameElement | null;
      if (iframe && iframe.contentWindow) {
        closeExportModal();
        iframe.contentWindow.print();
        return;
      } else {
        setErrorMessage("Could not locate the HTML preview frame for printing.");
        setStatus("error");
        return;
      }
    }

    const suggestedName = currentFile
      ? (currentFile.split("/").pop() ?? "document").replace(/\.(md|markdown|html|htm)$/i, ".pdf")
      : "document.pdf";

    const path = await tauriService.savePdfPicker(suggestedName);
    if (!path) return;

    setStatus("exporting");
    setErrorMessage("");

    try {
      const htmlContent = await markdownToHtmlAsync(markdownContent);
      const safeMargin = Math.max(0, Math.min(100, marginMm));
      const result = await tauriService.exportToPdf(htmlContent, {
        outputPath: path,
        pageSize,
        marginMm: safeMargin,
        includePageNumbers,
      });
      setOutputPath(result.outputPath);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "exporting") closeExportModal();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl shadow-2xl outline-none",
          "bg-[var(--color-surface)] border border-[var(--color-border)]",
          "p-6 animate-slide-up"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FileDown size={18} className="text-[var(--color-accent)]" />
            <h2 id="export-modal-title" className="text-base font-semibold text-[var(--color-text-primary)]">
              Export to PDF
            </h2>
          </div>
          {status !== "exporting" && (
            <Button variant="ghost" size="sm" onClick={closeExportModal} aria-label="Close">
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Options */}
        {status === "idle" || status === "error" ? (
          <>
            <div className="space-y-4 mb-6">
              {/* Page size */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                  Page Size
                </label>
                <div className="flex gap-2">
                  {(["A4", "Letter", "Legal"] as PageSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => { setPageSize(size); }}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                        pageSize === size
                          ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                          : "bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div>
                <label htmlFor="margin-mm" className="block mb-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                  Margin: <span className="text-[var(--color-accent)]">{marginMm}mm</span>
                </label>
                <input
                  id="margin-mm"
                  type="range"
                  min={10}
                  max={40}
                  step={5}
                  value={marginMm}
                  onChange={(e) => { setMarginMm(Number(e.target.value)); }}
                  className="w-full accent-[var(--color-accent)]"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
                  <span>10mm</span><span>40mm</span>
                </div>
              </div>

              {/* Page numbers */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => { setIncludePageNumbers(e.target.checked); }}
                  className="w-4 h-4 rounded accent-[var(--color-accent)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Include page numbers
                </span>
              </label>
            </div>

            {status === "error" && (
              <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="md" onClick={closeExportModal}>
                Cancel
              </Button>
              <Button variant="solid" size="md" onClick={() => void handleExport()}>
                <FileDown size={15} className="mr-1.5" />
                Export PDF
              </Button>
            </div>
          </>
        ) : status === "exporting" ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 size={32} className="animate-spin text-[var(--color-accent)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">Generating PDF…</p>
          </div>
        ) : (
          /* Success */
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle size={40} className="text-green-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                PDF exported successfully!
              </p>
              <p className="text-xs text-[var(--color-text-muted)] break-all">
                {outputPath}
              </p>
            </div>
            <Button variant="solid" size="md" onClick={closeExportModal}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
