# DevAppLauncher

DevAppLauncher は、Tauri v2、Svelte 5、および DaisyUI を使用して構築された軽量なデスクトップアプリケーションです。ワークスペース内のプロジェクトを自動検出し、クリーンな GUI を通じてスクリプトの実行や Git 操作を可能にすることで、開発者のワークフローを簡素化します。

## 🚀 主な機能

- **プロジェクトの自動検出**: 指定したフォルダ（ワークスペース）とその直下のサブディレクトリをプロジェクトとして自動登録します。
- **フォルダ名優先の管理**: `package.json` の名前よりも実際のフォルダ名を優先して表示します。
- **マルチワークスペース対応**: 複数のルートディレクトリを登録・管理できます。
- **スクリプトランチャー**: `package.json` を解析し、定義されているすべてのスクリプトを実行ボタンとして自動生成します。
- **パッケージマネージャー自動判別**: ロックファイルを元に `npm`、`pnpm`、`yarn`、`bun` を自動的に判別します。
- **Git 連携**: 設定した Git サーバー URL を元に、リポジトリのクローン（リンク）やプッシュが GUI から行えます。認証用トークン（PAT）にも対応しています。
- **リアルタイムログ**: 実行中のコマンドの `stdout` および `stderr` をリアルタイムで表示します。
- **マルチプラットフォーム対応**: Windows と macOS をサポート。Windows 特有のコマンド拡張子（`.cmd`、`.exe`）も自動制御します。
- **多言語対応 (i18n)**: 日本語と英語の切り替えに対応しています。

## 🛠 技術スタック

- **フロントエンド**: [Svelte 5](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/)
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/), [DaisyUI v5](https://daisyui.com/)
- **バックエンド**: [Tauri v2](https://tauri.app/) (Rust)
- **プラグイン**:
  - `tauri-plugin-shell`
  - `tauri-plugin-dialog`
  - `tauri-plugin-fs`
  - `tauri-plugin-os`
- **多言語化**: `svelte-i18n`

## 📦 インストール方法

### 前提条件

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18 以上)
- OS ごとの依存関係（[Tauri Prerequisites](https://tauri.app/v2/guides/prerequisites/) を参照）

### セットアップ

1. リポジトリをクローンします：
   ```bash
   git clone <repository-url>
   cd dev-app-launcher
   ```

2. 依存関係をインストールします：
   ```bash
   npm install
   ```

3. 開発モードで実行します：
   ```bash
   npm run tauri dev
   ```

4. 本番用にビルドします：
   ```bash
   npm run tauri build
   ```

## 📖 使い方

1. **ワークスペースの追加**: 初回起動時に「ワークスペースを追加」をクリックし、プロジェクトが配置されているルートディレクトリを選択します。
2. **プロジェクトの選択**: サイドバーに検出されたプロジェクトが表示されるので、操作したいプロジェクトを選択します。
3. **スクリプトの実行**: 「インストール」ボタンで依存関係を導入したり、定義されたスクリプトボタン（`dev`, `build`, `test` など）をクリックして実行します。
4. **Git 操作**: 設定から Git サーバーの URL と認証情報を入力しておくと、プロジェクト画面からクローンやプッシュが簡単に行えます。
5. **設定**: 歯車アイコンから、ワークスペースの追加削除や言語の切り替えが可能です。

## 📄 ライセンス

MIT
