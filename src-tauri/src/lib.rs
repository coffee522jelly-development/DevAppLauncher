// DevAppLauncher のバックエンドエントリポイント
// Tauri v2 のコア機能とプラグインの初期化を行います。

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // OS 情報を取得するためのプラグイン（Windows/macOS 判定に使用）
        .plugin(tauri_plugin_os::init())
        // 外部コマンド（npm, git等）を実行するためのプラグイン
        .plugin(tauri_plugin_shell::init())
        // ファイル選択ダイアログを表示するためのプラグイン
        .plugin(tauri_plugin_dialog::init())
        // ファイルシステムの読み書き・存在確認を行うためのプラグイン
        .plugin(tauri_plugin_fs::init())
        // ブラウザやエクスプローラーで特定のパスを開くためのプラグイン
        .plugin(tauri_plugin_opener::init())
        // アプリケーションの実行
        .run(tauri::generate_context!())
        // エラー発生時のハンドリング
        .expect("error while running tauri application");
}
