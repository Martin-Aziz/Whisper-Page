#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Lumina entry point.
/// Minimal bootstrap — wires up Tauri runtime and hands off to `lib.rs`.
fn main() {
    lumina_lib::run();
}
