pub mod commands;

use commands::{file_commands, pdf_commands, window_commands};
use tracing_subscriber::{fmt, EnvFilter};

/// Initializes structured logging.
/// Uses JSON format in release, pretty format in debug.
fn init_logging() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    #[cfg(debug_assertions)]
    fmt().with_env_filter(filter).with_target(true).init();

    #[cfg(not(debug_assertions))]
    fmt()
        .json()
        .with_env_filter(filter)
        .with_target(true)
        .init();
}

/// Main application entry point called from `main.rs`.
/// Registers all Tauri plugins and IPC command handlers.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_logging();

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            file_commands::read_file,
            file_commands::write_file,
            file_commands::file_exists,
            file_commands::get_file_metadata,
            pdf_commands::export_to_pdf,
            window_commands::toggle_fullscreen,
            window_commands::set_window_title,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Lumina application");
}
