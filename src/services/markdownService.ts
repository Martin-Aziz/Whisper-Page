import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked for GitHub-flavored markdown
marked.use({
  gfm: true,
  breaks: false,
});

let worker: Worker | null = null;

function getWorker(): Worker | null {
  if (!worker && typeof window !== "undefined" && typeof Worker !== "undefined") {
    worker = new Worker(
      new URL("../workers/markdownWorker.ts", import.meta.url),
      { type: "module" }
    );
  }
  return worker;
}

/**
 * Converts markdown source text to sanitized HTML asynchronously using a Web Worker.
 * This prevents the main UI thread from blocking on large files.
 *
 * @param markdown - Raw markdown string from the editor
 * @returns Promise resolving to safe HTML string
 */
export function markdownToHtmlAsync(markdown: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tryProcess = () => {
      const w = getWorker();
      if (!w) {
        // Fallback for tests/environments without Worker
        try {
          resolve(markdownToHtml(markdown));
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        const { html, error, success } = event.data as { html: string; error: string; success: boolean };
        w.removeEventListener("message", handleMessage);
        w.onerror = null;

        if (success) {
          const sanitized = DOMPurify.sanitize(html, {
            ADD_TAGS: ["math", "semantics", "mrow", "mi", "mo", "mn", "msup"],
            ADD_ATTR: ["class", "style", "xmlns"],
          });
          resolve(sanitized);
        } else {
          reject(new Error(error || "Worker failed"));
        }
      };

      const handleError = (event: ErrorEvent) => {
        w.removeEventListener("message", handleMessage);
        w.onerror = null;
        reject(new Error(event.message || "Worker crashed"));
      };

      w.onerror = handleError;
      w.addEventListener("message", handleMessage);
      w.postMessage(markdown);
    };

    tryProcess();
  });
}

/**
 * Converts markdown source text to sanitized HTML synchronously.
 * Fallback for environments or specific use cases where async isn't ideal.
 */
export function markdownToHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string;
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["math", "semantics", "mrow", "mi", "mo", "mn", "msup"],
    ADD_ATTR: ["class", "style", "xmlns"],
  });
}

/**
 * Strips markdown syntax from text, returning plain readable text.
 * Useful for generating document titles or word-count previews.
 *
 * @param markdown - Raw markdown string
 * @returns Plain text with all markdown syntax removed
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, "")      // Headings
    .replace(/[*_~`]+/g, "")         // Inline emphasis
    .replace(/!\[.*?\]\(.+?\)/g, "")  // Images (must run before link pattern)
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links → label only
    .replace(/^\s*[-*+]\s+/gm, "")   // Unordered list bullets
    .replace(/^\s*\d+\.\s+/gm, "")   // Ordered list numbers
    .replace(/^>\s+/gm, "")          // Blockquotes
    .replace(/^\s*---+\s*$/gm, "")   // Horizontal rules
    .replace(/\n{3,}/g, "\n\n")      // Collapse extra blank lines
    .trim();
}

/**
 * Extracts the first heading from a markdown document, falling back to
 * the first non-empty line of plain text.
 *
 * Used to generate a suggested file name for "Save As" dialogs.
 *
 * @param markdown - Raw markdown string
 * @returns A suitable document title string
 */
export function extractDocumentTitle(markdown: string): string {
  const headingMatch = markdown.match(/^#{1,3}\s+(.+)$/m);
  if (headingMatch?.[1]) {
    return headingMatch[1].trim();
  }

  const firstLine = markdown.split("\n").find((l) => l.trim().length > 0);
  if (firstLine) {
    return markdownToPlainText(firstLine).slice(0, 60);
  }

  return "Untitled";
}

/**
 * Counts the number of words in a markdown string.
 * Strips markdown syntax before counting so formatting characters
 * don't inflate the count.
 *
 * @param markdown - Raw markdown string
 * @returns Integer word count (0 for empty/whitespace-only input)
 */
export function countWords(markdown: string): number {
  const plain = markdownToPlainText(markdown);
  const trimmed = plain.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Estimates reading time for a document in minutes.
 * Assumes an average reading speed of 238 WPM.
 *
 * @param markdown - Raw markdown string
 * @returns Estimated reading time string (e.g. "3 min read")
 */
export function estimateReadingTime(markdown: string): string {
  const words = countWords(markdown);
  const minutes = Math.max(1, Math.ceil(words / 238));
  return String(minutes) + " min read";
}
