import { describe, it, expect } from "vitest";
import {
  markdownToHtml,
  markdownToPlainText,
  extractDocumentTitle,
  countWords,
  estimateReadingTime,
} from "@/services/markdownService";

describe("markdownService", () => {
  describe("markdownToHtml", () => {
    it("converts heading to H1 element", () => {
      const html = markdownToHtml("# Hello World");
      expect(html).toContain("<h1");
      expect(html).toContain("Hello World");
    });

    it("converts bold syntax to strong element", () => {
      const html = markdownToHtml("**bold text**");
      expect(html).toContain("<strong>bold text</strong>");
    });

    it("converts italic syntax to em element", () => {
      const html = markdownToHtml("_italic_");
      expect(html).toContain("<em>italic</em>");
    });

    it("converts inline code to code element", () => {
      const html = markdownToHtml("`code`");
      expect(html).toContain("<code>code</code>");
    });

    it("converts link to anchor with href", () => {
      const html = markdownToHtml("[Lumina](https://example.com)");
      expect(html).toContain('<a href="https://example.com"');
      expect(html).toContain("Lumina");
    });

    it("converts fenced code block", () => {
      const html = markdownToHtml("```js\nconsole.log('hello');\n```");
      expect(html).toContain("<pre>");
      expect(html).toContain("<code");
    });

    it("converts GFM table", () => {
      const md = [
        "| Name | Age |",
        "| ---- | --- |",
        "| Alice | 30 |",
      ].join("\n");
      const html = markdownToHtml(md);
      expect(html).toContain("<table");
      expect(html).toContain("<th");
      expect(html).toContain("Alice");
    });

    it("sanitises script injection (XSS guard)", () => {
      const html = markdownToHtml('<script>alert("xss")</script>');
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("alert");
    });

    it("sanitises onclick injection (XSS guard)", () => {
      const html = markdownToHtml('<a href="#" onclick="evil()">click</a>');
      expect(html).not.toContain("onclick");
    });

    it("returns empty string for empty input", () => {
      const html = markdownToHtml("");
      expect(html.trim()).toBe("");
    });
  });

  describe("markdownToPlainText", () => {
    it("strips heading syntax", () => {
      expect(markdownToPlainText("# Title")).toBe("Title");
    });

    it("strips bold syntax", () => {
      expect(markdownToPlainText("**bold**")).toBe("bold");
    });

    it("strips link syntax, keeping label", () => {
      expect(markdownToPlainText("[Lumina](https://example.com)")).toBe("Lumina");
    });

    it("removes image syntax", () => {
      expect(markdownToPlainText("![alt](img.png)")).toBe("");
    });

    it("preserves plain text unchanged", () => {
      expect(markdownToPlainText("Hello world")).toBe("Hello world");
    });
  });

  describe("extractDocumentTitle", () => {
    it("extracts H1 heading", () => {
      expect(extractDocumentTitle("# My Article\n\nContent here")).toBe("My Article");
    });

    it("extracts H2 heading when H1 is absent", () => {
      expect(extractDocumentTitle("## Section\n\nText")).toBe("Section");
    });

    it("falls back to first non-empty line as plain text", () => {
      expect(extractDocumentTitle("This is the title\n\nBody text")).toBe(
        "This is the title"
      );
    });

    it('returns "Untitled" for empty string', () => {
      expect(extractDocumentTitle("")).toBe("Untitled");
    });

    it("truncates long first line to 60 characters", () => {
      const longLine = "A".repeat(80);
      expect(extractDocumentTitle(longLine).length).toBeLessThanOrEqual(60);
    });
  });

  describe("countWords", () => {
    it("counts words in plain text", () => {
      expect(countWords("one two three")).toBe(3);
    });

    it("counts words with markdown stripped", () => {
      expect(countWords("**one** _two_ three")).toBe(3);
    });

    it("returns 0 for empty string", () => {
      expect(countWords("")).toBe(0);
    });

    it("returns 0 for whitespace-only string", () => {
      expect(countWords("   \n\t  ")).toBe(0);
    });

    it("handles multiple spaces between words", () => {
      expect(countWords("one   two   three")).toBe(3);
    });
  });

  describe("estimateReadingTime", () => {
    it('returns "1 min read" for short documents', () => {
      expect(estimateReadingTime("Hello world")).toBe("1 min read");
    });

    it("calculates reading time for ~238-word document", () => {
      const text = Array(238).fill("word").join(" ");
      expect(estimateReadingTime(text)).toBe("1 min read");
    });

    it("calculates reading time for ~500-word document", () => {
      const text = Array(500).fill("word").join(" ");
      expect(estimateReadingTime(text)).toBe("3 min read");
    });

    it("returns at least 1 minute for any non-empty content", () => {
      expect(estimateReadingTime("x")).toBe("1 min read");
    });
  });
});
