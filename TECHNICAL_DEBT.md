# Technical Debt

Tracked items with priority, impact, and resolution plan.
Items are ordered by business impact × effort ratio.

---

## P1 — Markdown Round-Trip in WYSIWYG Mode

**Type**: Architecture
**Impact**: High — files edited in WYSIWYG mode lose clean markdown formatting
**Effort**: 2–3 days
**Owner**: Core team

**Problem**: TipTap's internal state uses ProseMirror JSON/HTML natively. Storing HTML
in the Zustand store means round-tripping through the source editor produces HTML-enriched
markdown rather than clean GFM markdown.

**Solution**: Integrate `@tiptap/extension-markdown` to enable markdown-native serialisation.
This requires schema mapping for all TipTap nodes to markdown equivalents.

**Acceptance Criteria**:
- File saved after WYSIWYG edit opens cleanly in VS Code / GitHub without HTML tags.
- All GFM elements (tables, task lists, code blocks) round-trip correctly.

---

## P2 — PDF Export Without Chrome Dependency

**Type**: Infrastructure
**Impact**: Medium — ~15% of users don't have Chrome installed
**Effort**: 1 day
**Owner**: Platform team

**Problem**: Current PDF export invokes headless Chrome CLI. Users without Chrome
receive a fallback HTML file with instructions to print manually.

**Solutions (in preference order)**:
1. Ship `@puppeteer/browsers` to download a pinned Chromium binary on first use.
2. Integrate `wkhtmltopdf` binary (MIT-licensed, pre-built).
3. Use `printpdf` Rust crate for pure-Rust PDF (limited CSS support).

---

## P3 — Image Asset Management

**Type**: Feature gap
**Impact**: Medium — base64 images inflate file size significantly
**Effort**: 1 day
**Owner**: Core team

**Problem**: Pasted/dropped images are stored as base64 data URIs inline in the markdown.
A single screenshot can add 500KB+ to the file.

**Solution**: On image insert, copy to `<filename>-assets/` folder and use relative path reference.
Watch the assets folder for deletions and prompt when a referenced image is missing.

---

## P4 — Mermaid Diagram Rendering

**Type**: Feature gap
**Impact**: Low — affects ~10% of developers who use diagrams
**Effort**: 0.5 days
**Owner**: Core team

**Problem**: Mermaid fenced code blocks (`\`\`\`mermaid`) render as raw code in preview.

**Solution**: Add `mermaid` npm package and custom CodeMirror decoration / TipTap node
extension that renders diagrams inline.

---

## P5 — Font Offline Availability

**Type**: UX
**Impact**: Low — affects offline-first users
**Effort**: 0.5 days
**Owner**: Frontend team

**Problem**: Fonts are loaded from Google Fonts CDN. Without internet, fallback system
fonts are used (acceptable but not polished).

**Solution**: Replace `@import url(google fonts)` with `@fontsource/inter`,
`@fontsource/merriweather`, `@fontsource/jetbrains-mono`. Adds ~2MB to bundle.

---

## P6 — Multi-Document Tabs

**Type**: Feature request
**Impact**: Medium-high — power users want tabs
**Effort**: 3–4 days
**Owner**: Core team

**Problem**: MVP is single-document interface. Users must open multiple windows manually.

**Solution**: Implement tab bar using Tauri's multi-window API or virtual tabs in the
single WebView. Each tab maintains independent editor + file state.

---

## Resolved Debt

| Item | Resolved | Version |
|------|----------|---------|
| Atomic file writes (temp+rename) | ✅ | MVP |
| XSS sanitisation (DOMPurify) | ✅ | MVP |
| Theme FOUC prevention | ✅ | MVP |
| Word count strips markdown syntax | ✅ | MVP |
