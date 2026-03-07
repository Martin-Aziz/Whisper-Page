import { marked } from "marked";

// Configure marked for GitHub-flavored markdown
marked.use({
    gfm: true,
    breaks: false,
});

/**
 * Markdown Web Worker.
 * Offloads parsing from the main UI thread to prevent UI stutter
 * on very large documents.
 */
self.onmessage = (event: MessageEvent<string>) => {
    const markdown = event.data;
    try {
        // Note: DOMPurify is omitted here as it requires a DOM.
        // We sanitize on the main thread or use a worker-safe approach.
        const html = marked.parse(markdown);
        self.postMessage({ html, success: true });
    } catch (error) {
        self.postMessage({
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
        });
    }
};
