# ADR-002: Hybrid TipTap + CodeMirror Editor Architecture

**Date**: 2025-03-07
**Status**: Accepted
**Deciders**: Frontend architecture team

---

## Context

The specification requires:
1. **True WYSIWYG editing** — edit rendered markdown directly (Typora-style)
2. **Source mode** — raw markdown with syntax highlighting
3. **Live split-pane preview** — source left, rendered right
4. **Large file support** — handle 1MB+ files without lag
5. **Rich markdown support** — GFM tables, task lists, code blocks, math

No single editor library satisfies all requirements equally.

---

## Decision

Use a **hybrid architecture**:
- **TipTap (ProseMirror)** for WYSIWYG mode
- **CodeMirror 6** for source mode
- Zustand store as the shared content bridge

---

## Rationale

### TipTap for WYSIWYG

| Criterion | TipTap | Slate.js | Lexical |
|-----------|--------|----------|---------|
| ProseMirror foundation | ✅ | ❌ | ❌ |
| React integration | ✅ Native | ✅ | ✅ |
| Table editing | ✅ Plugin | 🟡 Manual | 🟡 Manual |
| Collaborative-ready | ✅ Y.js | 🟡 | 🟡 |
| Extensions ecosystem | ✅ 50+ | 🟡 | 🟡 |
| Bundle size | ~300KB | ~400KB | ~200KB |

TipTap's ProseMirror foundation is the same base as Atlassian's editor and Notion's doc editor
— proven at production scale.

### CodeMirror 6 for Source Mode

| Criterion | CodeMirror 6 | Monaco | Ace |
|-----------|-------------|--------|-----|
| Virtual scrolling | ✅ | ✅ | ❌ |
| Bundle size | ~200KB | >10MB | ~400KB |
| Markdown language support | ✅ Native | 🟡 | 🟡 |
| Tree-sitter parsing | ✅ Lezer | ❌ | ❌ |
| Mobile-friendly | ✅ | ❌ | 🟡 |

Monaco is designed for IDE use cases (IntelliSense, debugging). Its 10MB+ bundle is
disproportionate for a markdown source editor.

### Zustand as Content Bridge

```
User types (WYSIWYG)  →  TipTap  →  tiptap.getHTML()  →  Zustand store
                                                               ↕
User types (source)   →  CodeMirror  →  doc.toString()  →  Zustand store
                                                               ↕
Preview pane          ←  markdownToHtml()  ←  Zustand store
```

---

## Consequences

**Positive:**
- Best-in-class editing experience in both modes
- CodeMirror 6 virtual scrolling handles 100k-line files without lag
- TipTap's extension API makes adding future features (Mermaid, AI, etc.) straightforward

**Negative / Trade-offs:**
- Two editor libraries = larger bundle than a single-editor solution
  → Mitigated by tree-shaking; only used extensions are bundled
- Content serialisation mismatch: TipTap HTML ≠ clean markdown
  → Documented as P1 technical debt; resolved by `@tiptap/extension-markdown`

---

## Alternatives Considered

| Alternative | Rejected Reason |
|-------------|-----------------|
| **CodeMirror 6 only** | No native WYSIWYG; would require custom rendering layer |
| **TipTap only** | Source mode would be TipTap's `plainText` view — poor syntax highlighting |
| **Milkdown** | Interesting but less mature ecosystem; limited extensions |
| **Quill** | Stagnant development; no virtual scrolling |
