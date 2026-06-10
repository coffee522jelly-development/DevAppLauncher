# DevAppLauncher (v2.0)

DevAppLauncher は、Tauri v2、Svelte 5、および shadcn-svelte を使用して構築された、開発者のための強力かつ軽量なデスクトップ・プロジェクト・ランチャーです。
多数の Node.js プロジェクトを抱える開発者が、ターミナルを開くことなく、直感的な GUI からプロジェクトの管理、実行、メンテナンスを行えるように設計されています。

## 🚀 主な機能

### 📦 プロジェクト管理 & 実行
- **スマート・スキャニング**: 指定したワークスペース内の Node.js プロジェクトを自動検出（深度1）。`package.json` が含まれるディレクトリを即座に登録します。
- **スクリプト・自動生成**: `package.json` 内の全スクリプトをボタンとして自動配置。
- **Tauri プロジェクト対応**: `src-tauri` ディレクトリを検出し、専用の `dev` / `build` ボタンを提供。
- **パッケージマネージャー自動判別**: `npm`, `pnpm`, `yarn`, `bun` をロックファイルから自動検知し、適切なコマンドを実行。
- **カスタムコマンド実行**: 任意のシェルコマンドを入力して実行可能。実行履歴（History）も保持。

### 🛠 開発者ユーティリティ
- **ワンクリック・ショートカット**: プロジェクトを VS Code で開く、またはエクスプローラーで表示。
- **メンテナンスツール**: 脆弱性診断 (`audit fix`)、更新チェック (`outdated`)、ビルド成果物の簡易サーバー確認 (`preview`)。
- **バージョン確認**: Node.js や npm のバージョンをダッシュボードから即座に確認。
- **環境構築ウィザード**: Node.js, Rust, MSVC, Tauri CLI の導入を補助する Setup Wizard（Windows向け）。

### 🐙 Git 連携
- **リポジトリ・リンク**: 設定した Git サーバー URL に基づき、ローカルフォルダをリモートリポジトリに自動リンク。
- **プッシュ & クローン**: GUI から簡単に Git 操作を実行。PAT（パーソナルアクセストークン）のマスク機能により、ログに秘密情報が残らない安全設計。

### 🎨 洗練された UI/UX
- **モダンデザイン**: `shadcn/ui` パターンと `Bits UI` プリミティブを採用した、プロフェッショナルな外観。
- **コンパクト・レイアウト**: 画面占有を最小限に抑えつつ、情報密度を確保した高密度デザイン。
- **テーマカスタマイズ**: `DaisyUI v5` による 30 種類以上のテーマ切り替えに対応。
- **多言語対応 (i18n)**: 日本語と英語を完全にサポート。

## 🛠 技術スタック

- **フレームワーク**: [Svelte 5 (Runes)](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/)
- **デスクトップ**: [Tauri v2](https://tauri.app/) (Rust)
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/), [DaisyUI v5](https://daisyui.com/)
- **コンポーネント**: [Bits UI](https://www.bits-ui.com/), [shadcn-svelte](https://shadcn-svelte.com/)
- **アイコン**: [Lucide Svelte](https://lucide.dev/)
- **プラグイン**: `shell`, `dialog`, `fs`, `os`, `opener`
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
