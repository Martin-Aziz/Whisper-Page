# ADR-001: Tauri 2 over Electron

**Date**: 2025-03-07
**Status**: Accepted
**Deciders**: Core architecture team

---

## Context

Lumina is a desktop markdown editor requiring:
1. Native file system access (open/save `.md` files)
2. Native OS dialogs (file picker, save dialog)
3. PDF generation capability
4. Automatic updates
5. Cross-platform (macOS, Windows, Linux)
6. Competitive performance (sub-500ms startup, <50MB RAM)

The de facto standard for cross-platform desktop apps with web-based UIs is **Electron**
(used by Typora, Obsidian, VS Code, Atom, Slack, Discord). However, Electron's resource
usage violates our performance SLAs.

---

## Decision

Use **Tauri 2.x** (Rust backend + system WebView) instead of Electron.

---

## Rationale

| Metric | Tauri 2 | Electron | Our Target |
|--------|---------|----------|------------|
| Binary size | 5–15 MB | 80–150 MB | <15MB ✅ |
| RAM (idle) | 30–50 MB | 200–500 MB | <50MB ✅ |
| Startup time | 0.3–0.5s | 1–3s | <500ms ✅ |
| Security | Rust memory safety | Node.js attack surface | Memory-safe ✅ |

**Additional advantages:**
- Rust backend for file I/O: atomic writes natively via `tempfile` crate
- Fine-grained capability system: whitelist exactly which APIs the WebView can call
- No bundled Chromium: uses the OS WebView (WebKit on macOS, WebView2 on Windows)

---

## Consequences

**Positive:**
- 10x smaller binary → faster downloads, smaller updates
- 5–10x less RAM → stays snappy even on older machines
- Rust safety → no memory leaks from backend (file watchers, PDF export)

**Negative / Risks:**
- WebView rendering inconsistencies across platforms (different CSS engines)
  → Mitigation: test-driven development with Playwright on Windows, macOS, and Linux
- Smaller plugin ecosystem than Electron
  → Mitigated by Tauri 2 plugin API being stable and official plugins for all needed features
- Rust learning curve
  → Mitigated by keeping Rust code thin (delegate logic to TypeScript where possible)

---

## Alternatives Considered

| Alternative | Rejected Reason |
|-------------|-----------------|
| **Electron** | Violates RAM <50MB and startup <500ms SLAs |
| **NW.js** | Older, lower community investment than Electron |
| **Neutralinojs** | Smaller ecosystem; less mature plugin system |
| **Flutter Desktop** | UI paradigm mismatch (we need web rendering for markdown) |
| **Native (Swift/C++)** | 3x development cost; no code sharing with web |
