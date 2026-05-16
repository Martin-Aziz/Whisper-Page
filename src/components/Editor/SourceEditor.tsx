import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState as CMState, Compartment } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";
import { useThemeStore } from "@/store/themeStore";

/**
 * Raw markdown source editor powered by CodeMirror 6.
 * Provides syntax highlighting, virtual scrolling (handles 100k+ lines),
 * and cursor position tracking for the status bar.
 *
 * Syncs content bidirectionally with the Zustand store.
 *
 * @layer Component
 */
export default function SourceEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());

  const { markdownContent, setMarkdownContent, setCursorPosition } = useEditorStore();
  const { setDirty } = useFileStore();
  const { resolvedTheme } = useThemeStore();

  // Bootstrap the CM editor once
  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
      }),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString();
          setMarkdownContent(content);
          setDirty(true);
        }
        // Track cursor position for StatusBar
        const selection = update.state.selection.main;
        const line = update.state.doc.lineAt(selection.head);
        setCursorPosition(line.number, selection.head - line.from + 1);
      }),
      themeCompartment.current.of(resolvedTheme === "dark" ? oneDark : []),
    ];

    const state = CMState.create({
      doc: markdownContent,
      extensions,
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only bootstrap once — dynamic updates handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconfigure theme extension without recreating the view (preserves undo history)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: themeCompartment.current.reconfigure(
        resolvedTheme === "dark" ? oneDark : []
      ),
    });
  }, [resolvedTheme]);

  // Apply external content changes (e.g. file open) into CM
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (current !== markdownContent) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: markdownContent },
      });
    }
  }, [markdownContent]);

  return (
    <div
      ref={containerRef}
      className="source-editor h-full overflow-auto"
      style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
      aria-label="Markdown source editor"
    />
  );
}
