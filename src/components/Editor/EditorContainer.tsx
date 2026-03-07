import { useRef } from "react";
import WysiwygEditor from "./WysiwygEditor";
import SourceEditor from "./SourceEditor";
import { useEditorStore } from "@/store/editorStore";
import { markdownToHtml } from "@/services/markdownService";
import { cn } from "@/utils/cn";

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
  const { mode, splitMode, isFocusMode, markdownContent } = useEditorStore();
  const wysiwygRef = useRef(null);

  const showWysiwyg = mode === "wysiwyg";
  const showSource = mode === "source";
  const showPreview = showSource && splitMode === "preview-right";

  return (
    <main
      className={cn(
        "flex flex-1 overflow-hidden bg-[var(--color-surface)]",
        isFocusMode && "focus-mode"
      )}
    >
      {/* WYSIWYG mode */}
      {showWysiwyg && (
        <div className="editor-scroll flex-1 overflow-y-auto px-6 py-10">
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
              "flex-1 overflow-hidden border-r border-[var(--color-border)]",
              showPreview && "max-w-[50%]"
            )}
          >
            <SourceEditor />
          </div>

          {/* Live preview pane */}
          {showPreview && (
            <div className="flex-1 overflow-y-auto px-6 py-10 bg-[var(--color-surface)]">
              <article
                className="editor-content mx-auto max-w-[780px] prose"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(markdownContent) }}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
