use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::command;
use tracing::{error, info};

/// Metadata returned for a file.
#[derive(Debug, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub modified: Option<u64>,
    pub is_readonly: bool,
}

/// Reads the entire content of a UTF-8 text file.
///
/// # Errors
/// Returns an error string if the file cannot be read or is not valid UTF-8.
#[command]
pub async fn read_file(path: String) -> Result<String, String> {
    let file_path = PathBuf::from(&path);

    info!("Reading file: {}", path);

    tokio::fs::read_to_string(&file_path)
        .await
        .map_err(|e| {
            error!("Failed to read file {}: {}", path, e);
            format!("Failed to read file: {}", e)
        })
}

/// Atomically writes content to a file.
/// Writes to a temporary file first, then renames to the target path.
/// This prevents data loss if the process is interrupted mid-write.
///
/// # Errors
/// Returns an error string if the write fails.
#[command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    let file_path = PathBuf::from(&path);
    let parent = file_path.parent().ok_or("Invalid file path")?;

    info!("Writing file: {} ({} bytes)", path, content.len());

    // Atomic write: write to temp file, then rename
    let tmp = tempfile::NamedTempFile::new_in(parent).map_err(|e| {
        error!("Failed to create temp file: {}", e);
        format!("Failed to create temp file: {}", e)
    })?;

    tokio::fs::write(tmp.path(), content.as_bytes())
        .await
        .map_err(|e| {
            error!("Failed to write temp file: {}", e);
            format!("Failed to write temp file: {}", e)
        })?;

    tmp.persist(&file_path).map_err(|e| {
        error!("Failed to persist file {}: {}", path, e);
        format!("Failed to save file: {}", e)
    })?;

    info!("File saved successfully: {}", path);
    Ok(())
}

/// Checks whether a file exists at the given path.
#[command]
pub async fn file_exists(path: String) -> bool {
    tokio::fs::try_exists(&path).await.unwrap_or(false)
}

/// Returns metadata for a file: name, size, modification time, read-only status.
///
/// # Errors
/// Returns an error string if the metadata cannot be retrieved.
#[command]
pub async fn get_file_metadata(path: String) -> Result<FileMetadata, String> {
    let file_path = PathBuf::from(&path);

    let meta = tokio::fs::metadata(&file_path).await.map_err(|e| {
        format!("Cannot read metadata for {}: {}", path, e)
    })?;

    let modified = meta
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    let name = file_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "Untitled".to_string());

    // A file is read-only if we cannot obtain write permissions
    let is_readonly = meta.permissions().readonly();

    Ok(FileMetadata {
        path,
        name,
        size: meta.len(),
        modified,
        is_readonly,
    })
}
