use rusqlite::Connection;
use serde_json::{json, Value};
use std::sync::Mutex;
use tauri::State;

pub struct DbState(pub Mutex<Option<Connection>>);

#[tauri::command]
async fn run_sql(
    sql: String,
    params: Vec<Value>,
    method: String,
    state: State<'_, DbState>,
) -> Result<Value, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard
        .as_ref()
        .ok_or_else(|| "Database not initialized".to_string())?;

    // Convert JSON values to rusqlite parameters
    let sqlite_params: Vec<Box<dyn rusqlite::ToSql>> = params
        .iter()
        .map(|v| -> Box<dyn rusqlite::ToSql> {
            match v {
                Value::Null => Box::new(rusqlite::types::Null),
                Value::Bool(b) => Box::new(*b),
                Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(rusqlite::types::Null)
                    }
                }
                Value::String(s) => Box::new(s.clone()),
                _ => Box::new(v.to_string()),
            }
        })
        .collect();

    let params_refs: Vec<&dyn rusqlite::ToSql> = sqlite_params.iter().map(|p| p.as_ref()).collect();

    match method.as_str() {
        // INSERT, UPDATE, DELETE
        "run" => {
            let affected = conn
                .execute(&sql, params_refs.as_slice())
                .map_err(|e| e.to_string())?;
            Ok(json!({ "changes": affected }))
        }
        // SELECT single row
        "get" => {
            use rusqlite::types::ValueRef;
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let columns: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
            let row = stmt
                .query_row(params_refs.as_slice(), |row| {
                    let mut obj = serde_json::Map::new();
                    for (i, col) in columns.iter().enumerate() {
                        let value = match row.get_ref(i)? {
                            ValueRef::Null => Value::Null,
                            ValueRef::Integer(n) => Value::Number(n.into()),
                            ValueRef::Real(f) => json!(f),
                            ValueRef::Text(s) => {
                                Value::String(String::from_utf8_lossy(s).to_string())
                            }
                            ValueRef::Blob(_) => Value::Null,
                        };
                        obj.insert(col.clone(), value);
                    }
                    Ok(Value::Object(obj))
                })
                .map_err(|e| e.to_string())?;
            Ok(row)
        }
        // SELECT multiple rows
        "all" => {
            use rusqlite::types::ValueRef;
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let columns: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
            let rows = stmt
                .query_map(params_refs.as_slice(), |row| {
                    let mut obj = serde_json::Map::new();
                    for (i, col) in columns.iter().enumerate() {
                        let value = match row.get_ref(i)? {
                            ValueRef::Null => Value::Null,
                            ValueRef::Integer(n) => Value::Number(n.into()),
                            ValueRef::Real(f) => json!(f),
                            ValueRef::Text(s) => {
                                Value::String(String::from_utf8_lossy(s).to_string())
                            }
                            ValueRef::Blob(_) => Value::Null,
                        };
                        obj.insert(col.clone(), value);
                    }
                    Ok(Value::Object(obj))
                })
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect::<Vec<_>>();
            Ok(Value::Array(rows))
        }
        _ => Err(format!("Unknown method: {}", method)),
    }
}

#[tauri::command]
async fn init_database(path: String, state: State<'_, DbState>) -> Result<(), String> {
    let conn = Connection::open(&path).map_err(|e| e.to_string())?;
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = Some(conn);
    Ok(())
}

#[tauri::command]
async fn save_asset(
    filename: String,
    bytes: Vec<u8>,
    vault_path: String,
) -> Result<String, String> {
    // Path Traversal 방지: filename에서 파일명만 추출
    let safe_filename = std::path::Path::new(&filename)
        .file_name()
        .ok_or_else(|| "Invalid filename: path traversal detected".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid filename: non-UTF8 characters".to_string())?;

    let assets_dir = std::path::Path::new(&vault_path)
        .join(".taskdown")
        .join("assets");
    std::fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;

    let file_path = assets_dir.join(safe_filename);

    // 최종 경로가 assets_dir 내부인지 검증 (심볼릭 링크 우회 방지)
    let canonical_assets = assets_dir.canonicalize().map_err(|e| e.to_string())?;
    let canonical_file = file_path.parent()
        .ok_or_else(|| "Invalid file path".to_string())?
        .canonicalize()
        .map_err(|e| e.to_string())?
        .join(safe_filename);

    if !canonical_file.starts_with(&canonical_assets) {
        return Err("Path traversal attack detected".to_string());
    }

    std::fs::write(&file_path, bytes).map_err(|e| e.to_string())?;

    Ok(format!("asset://localhost/{}", safe_filename))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .manage(DbState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![run_sql, init_database, save_asset])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
