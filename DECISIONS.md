# Implementation Decisions & Assumptions

This document captures every significant assumption made during MVP development,
along with the alternatives considered and migration paths if an assumption proves wrong.

---

## Assumptions Made

### 1. PDF Export via Headless Chrome
**Context**: Specification required PDF export but did not specify the mechanism.
**Assumption**: Users likely have Chrome/Chromium installed (80%+ market share).
**Chosen approach**: Rust backend invokes headless Chrome CLI (`--print-to-pdf`).
**Fallback**: If Chrome not found, export sanitised print HTML so users can print from any browser.
**If wrong**: Library-based PDF (e.g. `printpdf` crate) as fallback; avoids external dependency
but sacrifices CSS fidelity. Documented in TECHNICAL_DEBT.md as Priority 1.

### 2. Markdown Storage Format in WYSIWYG Mode
**Context**: TipTap works natively with HTML; pure markdown serialisation requires a custom schema.
**Assumption**: Storing TipTap's HTML output in the editor store is acceptable for MVP.
**Chosen approach**: WYSIWYG mode stores HTML internally; source mode shows/edits markdown.
**If wrong**: Integrate `@tiptap/extension-markdown` for true round-trip markdown serialisation.
This is the most significant technical debt item — see TECHNICAL_DEBT.md.

### 3. No Backend Database
**Context**: Specification emphasised local-first with plain `.md` files.
**Assumption**: App state (recent files, preferences) fits in browser localStorage via Zustand persist.
**Chosen approach**: No database; use Tauri's localStorage bridge for persistence.
**If wrong**: Add SQLite via `tauri-plugin-store` for structured local data.

### 4. Font Downloading at Runtime
**Context**: Specification called for Inter, Merriweather, JetBrains Mono.
**Assumption**: Users have internet access on first launch for Google Fonts.
**Chosen approach**: Import from Google Fonts CDN in CSS.
**If wrong**: Bundle fonts in the binary using `@fontsource` packages. +2MB binary size.

### 5. KaTeX Math (Not MathJax)
**Context**: Specification requested LaTeX math support.
**Assumption**: KaTeX is sufficient; it covers 95% of common LaTeX commands.
**Chosen approach**: KaTeX extension for TipTap WYSIWYG, rendered in preview pane.
**If wrong**: Replace with MathJax 3 for full LaTeX compatibility. 3x larger bundle.

### 6. System Chrome for PDF (Not Bundled)
**Context**: Bundling a Chromium binary would add ~100MB to the installer.
**Assumption**: This defeats Lumina's core value proposition of a small binary.
**Chosen approach**: Use system Chrome; document requirement in README.
**If wrong** (no Chrome detected): Use `wkhtmltopdf` or `weasyprint` as system fallback.

### 7. Single-Window Architecture
**Context**: Specification did not mention multi-window or tabs.
**Assumption**: MVP is single-document interface (one file per window).
**Chosen approach**: Single Tauri window with sidebar for navigation.
**If wrong**: Tauri supports multiple windows; add tabbed interface via `tauri-plugin-window`.

---

## Technology Choices

| Decision | Alternatives Considered | Rationale | Migration Path |
|----------|------------------------|-----------|----------------|
| **Tauri 2** | Electron, NW.js, Neutralino | 10x smaller binary; Rust memory safety; 5x less RAM | Electron if Tauri WebView inconsistencies are blocking |
| **TipTap (ProseMirror)** | Slate.js, Lexical, Quill | ProseMirror maturity; TipTap extensions ecosystem | Slate.js if schema flexibility needed |
| **CodeMirror 6** | Monaco, Ace, CodeMirror 5 | Virtual scrolling; tree-sitter parsing; smallest bundle | Monaco if IntelliSense features requested |
| **Zustand 5** | Redux Toolkit, Jotai, Valtio | <1KB; no providers; simple API | Redux if DevTools/time-travel debugging needed |
| **Tailwind CSS 3** | CSS Modules, styled-components | JIT; <10KB production; no runtime | CSS Modules if utility-class cognitive load is an issue |
| **marked** | remark, markdown-it, showdown | Fastest CommonMark parser; tiny bundle | remark if AST manipulation needed for custom plugins |
| **DOMPurify** | sanitize-html | Fastest DOM-based sanitiser; battle-tested vs XSS | sanitize-html if server-side rendering needed (no DOM) |

---

## Architecture Deviations

### 1. Content Stored as HTML in WYSIWYG Mode
**Standard Pattern**: Store as markdown, render to HTML on demand.
**Deviation**: TipTap's state is HTML-native; converting to/from markdown on every keystroke
adds latency. For MVP, HTML is the in-memory format when in WYSIWYG mode.
**Justification**: <16ms render budget. Round-trip conversion adds 3–10ms per keystroke.
**Planned Fix**: Add `@tiptap/extension-markdown` in v1.1 for true markdown storage.

### 2. No Redux DevTools
**Standard Pattern**: Use Redux Toolkit for complex state with time-travel debugging.
**Deviation**: Zustand used instead; simpler API, no DevTools for state replay.
**Justification**: Editor state is simple (5 primitives); DevTools overhead not warranted.

---

## Known Technical Debt

### Priority 1 — Markdown Round-Trip (High Impact)
- **Issue**: WYSIWYG mode stores HTML; does not round-trip to clean markdown.
- **Impact**: Files opened in source mode after WYSIWYG edits may contain HTML tags.
- **Fix**: Integrate `@tiptap/extension-markdown` for markdown-native storage.
- **Effort**: 2–3 days.

### Priority 2 — PDF Without Chrome (Medium Impact)
- **Issue**: PDF export fails gracefully if Chrome is not installed.
- **Impact**: Users without Chrome cannot export to PDF (fallback to HTML).
- **Fix**: Bundle a minimal Chromium headless binary or use `weasyprint` Python library.
- **Effort**: 1 day.

### Priority 3 — Image Upload / Paste Handling (Medium Impact)
- **Issue**: Image drag-drop and clipboard paste are wired in the editor but not
  persisted — base64 images are stored inline.
- **Impact**: Large images bloat markdown files.
- **Fix**: Copy images to an `assets/` folder relative to the markdown file.
- **Effort**: 1 day.

### Priority 4 — Mermaid Diagram Support (Low Impact)
- **Issue**: Mermaid diagrams are not rendered in preview.
- **Fix**: Add `mermaid` npm package and custom markdown renderer extension.
- **Effort**: Half a day.
