/// Lumina entry point.
/// Minimal bootstrap — wires up Tauri runtime and hands off to `lib.rs`.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    lumina_lib::run();
}
