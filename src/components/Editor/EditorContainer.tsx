import { useRef, useState, useEffect } from "react";
import WysiwygEditor from "./WysiwygEditor";
import SourceEditor from "./SourceEditor";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";
import { markdownToHtmlAsync } from "@/services/markdownService";
import { cn } from "@/utils/cn";
import { PenLine, Focus } from "lucide-react";

/**
 * Smart container that renders the correct editor engine based on the
 * current mode, and manages the split-pane preview layout.
 *
 * Layout modes:
 * - `wysiwyg`                    → Full-width TipTap editor
 * - `source` + splitMode `off`   → Full-width CodeMirror
 * - `source` + splitMode `preview-right` → CodeMirror left, rendered HTML right
 *
 * @layer Component
 */
export default function EditorContainer() {
  const { mode, splitMode, isFocusMode, isFullscreenHtml, markdownContent, setFocusMode, setFullscreenHtml, setMode } = useEditorStore();
  const { currentFile } = useFileStore();
  const [html, setHtml] = useState("");
  const wysiwygRef = useRef(null);

  const isHtmlFile = currentFile?.toLowerCase().endsWith(".html") || currentFile?.toLowerCase().endsWith(".htm");

  useEffect(() => {
    let cancelled = false;
    if (isHtmlFile) {
      setHtml(markdownContent);
    } else {
      markdownToHtmlAsync(markdownContent)
        .then((result) => { if (!cancelled) setHtml(result); })
        .catch(console.error);
    }
    return () => { cancelled = true; };
  }, [markdownContent, isHtmlFile]);

  const showWysiwyg = mode === "wysiwyg";
  const showSource = mode === "source";
  const showPreview = showSource && splitMode === "preview-right";
  const showReadOnly = mode === "read-only";

  return (
    <main
      className={cn(
        "flex flex-1 overflow-hidden bg-[var(--color-surface)]",
        isFocusMode && "focus-mode"
      )}
    >
      {/* Focus Mode Exit Overlay */}
      {isFocusMode && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <button
            onClick={() => { setFocusMode(false); }}
            className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] px-4 py-2 rounded-full cursor-pointer shadow-lg cute-bounce flex items-center gap-2 font-medium text-sm border border-[var(--color-border)]"
          >
            <Focus className="w-4 h-4 text-[var(--color-accent)]" />
            Exit Focus
          </button>
        </div>
      )}

      {/* Rich Text mode */}
      {showWysiwyg && (
        <div className="editor-scroll flex-1 min-h-0 overflow-y-auto px-6 py-10 custom-scrollbar">
          <div
            className={cn(
              "editor-inner mx-auto",
              isFocusMode ? "max-w-[680px]" : "max-w-[780px]"
            )}
          >
            <WysiwygEditor ref={wysiwygRef} className="min-h-screen" />
          </div>
        </div>
      )}

      {/* Source mode */}
      {showSource && (
        <>
          <div
            className={cn(
              "flex-1 min-h-0 overflow-hidden border-r border-[var(--color-border)]",
              showPreview && "max-w-[50%]"
            )}
          >
            <SourceEditor />
          </div>

          {/* Live preview pane */}
          {showPreview && (
            <div
              className={cn(
                "custom-scrollbar",
                isFullscreenHtml
                  ? "fixed inset-0 z-[100] bg-[var(--color-surface)] p-0 m-0"
                  : "flex-1 min-h-0 overflow-y-auto px-6 py-10 bg-[var(--color-surface)]"
              )}
            >
              {isHtmlFile ? (
                <div className="relative w-full h-full">
                  <iframe
                    id="html-preview-frame"
                    className="w-full h-full border-none bg-white rounded-xl shadow-sm"
                    srcDoc={html}
                    sandbox="allow-scripts allow-same-origin"
                    title="HTML Preview"
                  />
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                      onClick={() => { setFullscreenHtml(!isFullscreenHtml); }}
                      className="bg-black/70 hover:bg-black text-white px-4 py-2 rounded-lg backdrop-blur-md shadow-lg font-medium text-sm transition-all flex items-center gap-2"
                    >
                      <Focus className="w-4 h-4" />
                      {isFullscreenHtml ? "Exit Fullscreen" : "Fullscreen"}
                    </button>
                    {isFullscreenHtml && (
                      <button
                        onClick={() => { setMode("read-only"); setFullscreenHtml(false); }}
                        className="bg-blue-600/90 hover:bg-blue-600 text-white px-4 py-2 rounded-lg backdrop-blur-md shadow-lg font-medium text-sm transition-all flex items-center gap-2"
                      >
                        <PenLine className="w-4 h-4" />
                        Read Mode
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <article
                  className="editor-content mx-auto max-w-[780px] prose"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Read-Only mode */}
      {showReadOnly && (
        <div
          className={cn(
            "custom-scrollbar relative group transition-all",
            isFullscreenHtml
              ? "fixed inset-0 z-[100] bg-[var(--color-surface)] p-0 m-0"
              : "flex-1 min-h-0 overflow-y-auto px-6 py-10 bg-transparent"
          )}
        >
          <div className="sticky top-4 right-4 ml-auto w-max z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            {isHtmlFile && (
              <button
                onClick={() => { setFullscreenHtml(!isFullscreenHtml); }}
                className="bg-[var(--color-surface-elevated)] backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] px-4 py-2 rounded-full cursor-pointer shadow-lg cute-bounce flex items-center gap-2 font-medium text-sm transition-all"
              >
                <Focus className="w-4 h-4 text-[var(--color-accent)]" />
                {isFullscreenHtml ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            )}
            {!isFullscreenHtml && (
              <button
                onClick={() => { setMode("wysiwyg"); }}
                className="bg-[var(--color-surface-elevated)] backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] px-4 py-2 rounded-full cursor-pointer shadow-lg cute-bounce flex items-center gap-2 font-medium text-sm transition-all"
              >
                <PenLine className="w-4 h-4 text-[var(--color-accent)]" />
                Edit Document
              </button>
            )}
          </div>
          <div
            className={cn(
              "mx-auto transition-all",
              isFullscreenHtml
                ? "w-full h-full max-w-none px-0 py-0 min-h-screen bg-white"
                : "book-reader-page max-w-[800px] min-h-[80vh] px-12 py-16 rounded-xl shadow-2xl border border-[var(--color-border)] mb-10 bg-white"
            )}
          >
            {isHtmlFile ? (
              <iframe
                id="html-preview-frame"
                className="w-full h-full border-none min-h-[70vh]"
                srcDoc={html}
                sandbox="allow-scripts allow-same-origin"
                title="HTML View"
              />
            ) : (
              <article
                className="editor-content prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
