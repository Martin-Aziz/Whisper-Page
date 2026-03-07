# Lumina

> **Write at the speed of thought** — A blazingly fast, beautiful local markdown editor built with Tauri + React.

[![CI](https://github.com/lumina-editor/lumina/actions/workflows/ci.yml/badge.svg)](https://github.com/lumina-editor/lumina/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## The Idea

Lumina is a **local-first desktop markdown editor** that combines the editing experience of Typora with the performance of a native application. Your files are plain `.md` files on your filesystem — no proprietary database, no cloud lock-in, no subscription.

Built on [Tauri 2](https://tauri.app) (Rust backend) instead of Electron, Lumina uses **30–50 MB RAM** at idle versus 200–500 MB for Electron apps, starts in under 500ms, and ships as a ~10 MB binary.

---

## Features

| Feature | Status |
|---------|--------|
| True WYSIWYG editing (TipTap/ProseMirror) | ✅ MVP |
| Source mode with syntax highlighting (CodeMirror 6) | ✅ MVP |
| Split-pane live preview | ✅ MVP |
| One-click PDF export (headless Chrome) | ✅ MVP |
| GitHub-flavored markdown (tables, task lists, code blocks) | ✅ MVP |
| Table insert wizard | ✅ MVP |
| Dark / light / system theme | ✅ MVP |
| Focus mode (typewriter mode) | ✅ MVP |
| Recent files sidebar | ✅ MVP |
| Keyboard-first workflow | ✅ MVP |
| KaTeX math expressions | ✅ MVP |
| Auto-save with atomic writes | ✅ MVP |
| Cross-platform (macOS, Windows, Linux) | ✅ MVP |
| Auto-updates | ✅ Bonus |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  WebView — React 19 + TypeScript                        │
│  TipTap (WYSIWYG) │ CodeMirror 6 (source)               │
│  Zustand stores   │ Tailwind CSS                        │
└────────────────────────┬────────────────────────────────┘
                         │ Tauri IPC (invoke)
┌────────────────────────▼────────────────────────────────┐
│  Rust Core — Tauri 2.x + Tokio                          │
│  File I/O (atomic)  │ PDF export (headless Chrome)       │
│  Window management  │ Native dialogs                    │
└─────────────────────────────────────────────────────────┘
```

**Bounded Contexts:**
- **Editor** — content state, modes (WYSIWYG/source/focus)
- **File System** — open/save/recent, dirty tracking, atomic writes
- **Export** — PDF generation, HTML rendering pipeline
- **Theme** — dark/light/system with CSS custom properties

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS+ |
| Rust | 1.77+ |
| System WebKit | macOS: built-in / Linux: `libwebkit2gtk-4.1-dev` |

```bash
# 1. Clone the repository
git clone https://github.com/lumina-editor/lumina.git
cd lumina

# 2. Install frontend dependencies
npm install

# 3. Run in development mode (hot reload)
npm run tauri:dev

# 4. Build production binary
npm run tauri:build
```

The built binary will be in `src-tauri/target/release/` and installers in `src-tauri/target/release/bundle/`.

---

## Development

### Running Tests

```bash
# All tests with coverage report (threshold: ≥90%)
npm test

# Fast unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E smoke tests (requires dev server: npm run dev)
npm run test:e2e

# Interactive test UI
npm run test:ui

# Type check only
npm run typecheck

# Lint
npm run lint
```

### Project Structure

```
lumina/
├── src/                    # React frontend (TypeScript)
│   ├── components/
│   │   ├── Editor/         # WysiwygEditor, SourceEditor, EditorContainer
│   │   ├── Toolbar/        # Formatting toolbar
│   │   ├── Sidebar/        # Recent files sidebar
│   │   ├── StatusBar/      # Word count, cursor position
│   │   ├── Modal/          # TableInsertModal, ExportModal
│   │   └── common/         # Button, Tooltip
│   ├── hooks/              # useFileOperations, useKeyboardShortcuts, useTheme
│   ├── services/           # tauriService (IPC), markdownService
│   ├── store/              # Zustand stores (editor, file, theme)
│   └── utils/              # cn() class utility
├── src-tauri/              # Rust Tauri backend
│   └── src/
│       └── commands/       # file_commands, pdf_commands, window_commands
├── tests/
│   ├── unit/               # Store + service logic tests
│   ├── integration/        # Cross-layer interaction tests
│   └── e2e/                # Playwright smoke tests
├── docs/adr/               # Architecture Decision Records
├── .github/workflows/      # CI/CD pipelines
└── DECISIONS.md            # Implementation assumptions & choices
```

---

## Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| New file | `⌘N` | `Ctrl+N` |
| Open file | `⌘O` | `Ctrl+O` |
| Save | `⌘S` | `Ctrl+S` |
| Save As | `⌘⇧S` | `Ctrl+Shift+S` |
| Export PDF | `⌘P` | `Ctrl+P` |
| Toggle sidebar | `⌘\` | `Ctrl+\` |
| Toggle focus mode | `⌘⇧F` | `Ctrl+Shift+F` |
| Toggle editor mode | `⌘E` | `Ctrl+E` |
| Bold | `⌘B` | `Ctrl+B` |
| Italic | `⌘I` | `Ctrl+I` |

---

## Performance vs Competitors

| Editor | Startup | RAM (idle) | Bundle |
|--------|---------|------------|--------|
| **Lumina** | **~0.5s** | **~50MB** | **~10MB** |
| Typora | ~1.5s | ~150MB | ~80MB |
| Obsidian | ~2s | ~200MB | ~120MB |
| VS Code | ~3s | ~300MB | ~200MB |

---

## Architecture Decisions

See [`DECISIONS.md`](DECISIONS.md) for assumptions and [`docs/adr/`](docs/adr/) for full ADRs.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Desktop runtime | Tauri 2 (Rust) | 10x smaller bundle, 5x less RAM vs Electron |
| WYSIWYG engine | TipTap (ProseMirror) | Extensible, collaborative-ready, GFM support |
| Source editor | CodeMirror 6 | Virtual scrolling, handles 100k+ lines |
| State management | Zustand | <1KB, minimal boilerplate |
| PDF export | Headless Chrome | Pixel-perfect CSS rendering |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Run tests before committing (`npm test && cargo test`)
4. Submit a pull request

All PRs require CI to pass (types + lint + tests ≥90% coverage).

---

## License

MIT — see [LICENSE](LICENSE).
