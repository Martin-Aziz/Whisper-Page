import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Underline from "@tiptap/extension-underline";
import { createLowlight, all } from "lowlight";
import { useEditorStore } from "@/store/editorStore";
import { useFileStore } from "@/store/fileStore";

const lowlight = createLowlight(all);

export interface WysiwygEditorHandle {
  focus: () => void;
  getHTML: () => string;
  getMarkdown: () => string;
}

interface WysiwygEditorProps {
  className?: string;
}

/**
 * WYSIWYG editor powered by TipTap (ProseMirror).
 * Renders markdown as rich text; syntax is hidden behind the rendered output.
 *
 * Syncs bidirectionally with the editor Zustand store:
 * - External markdown changes (e.g. opening a file) update the editor via `setContent`.
 * - User edits update the store via `onUpdate`.
 *
 * @layer Component
 */
const WysiwygEditor = forwardRef<WysiwygEditorHandle, WysiwygEditorProps>(
  ({ className }, ref) => {
    const { markdownContent, setMarkdownContent } = useEditorStore();
    const { setDirty } = useFileStore();

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false, // replaced by CodeBlockLowlight
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "editor-link" },
        }),
        Image.configure({
          allowBase64: true,
          HTMLAttributes: { class: "editor-image" },
        }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: "Start writing… (Markdown is supported)",
        }),
        Typography,
        CodeBlockLowlight.configure({ lowlight }),
        Underline,
      ],
      content: markdownContent,
      editorProps: {
        attributes: {
          class: "editor-content outline-none",
          spellcheck: "true",
        },
      },
      onUpdate: ({ editor }) => {
        // We store HTML in the WYSIWYG side for re-render fidelity;
        // source-mode receives markdown from the store.
        const html = editor.getHTML();
        setMarkdownContent(html);
        setDirty(true);
      },
    });

    // Apply external content changes (e.g. file open) into the editor
    useEffect(() => {
      if (!editor) return;
      const currentContent = editor.getHTML();
      if (currentContent !== markdownContent && markdownContent !== undefined) {
        editor.commands.setContent(markdownContent, false);
      }
    }, [markdownContent, editor]);

    useImperativeHandle(ref, () => ({
      focus: () => editor?.commands.focus(),
      getHTML: () => editor?.getHTML() ?? "",
      getMarkdown: () => editor?.getText() ?? "",
    }));

    return (
      <EditorContent
        editor={editor}
        className={className}
      />
    );
  }
);

WysiwygEditor.displayName = "WysiwygEditor";
export default WysiwygEditor;
