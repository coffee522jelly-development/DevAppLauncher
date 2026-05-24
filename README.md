# Tauri Workspace Project Launcher

A lightweight desktop application built with Tauri v2, Svelte 5, and DaisyUI. It simplifies your developer workflow by automatically detecting Node.js projects within your workspaces and allowing you to execute scripts via a clean GUI.

## 🚀 Features

- **Project Detection**: Automatically scans your workspace directories for Node.js projects (up to depth 3).
- **Multi-Workspace Support**: Add and manage multiple root directories.
- **Script Launcher**: Parses `package.json` and generates buttons for all your scripts.
- **Package Manager Aware**: Automatically detects `npm`, `pnpm`, `yarn`, or `bun` based on lock files.
- **Windows Support**: Handles Windows-specific command extensions (`.cmd`, `.exe`) automatically.
- **Live Logs**: Real-time streaming of `stdout` and `stderr` for running commands.
- **Internationalization (i18n)**: Full support for English and Japanese.
- **Lightweight & Fast**: Built with Tauri for a native desktop experience with minimal resource usage.

## 🛠 Tech Stack

- **Frontend**: [Svelte 5](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [DaisyUI v5](https://daisyui.com/)
- **Backend**: [Tauri v2](https://tauri.app/) (Rust)
- **Plugins**:
  - `tauri-plugin-shell`
  - `tauri-plugin-dialog`
  - `tauri-plugin-fs`
  - `tauri-plugin-os`
- **i18n**: `svelte-i18n`

## 📦 Installation

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18+)
- OS-specific dependencies (see [Tauri Prerequisites](https://tauri.app/v2/guides/prerequisites/))

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tauri-workspace-launcher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

4. Build for production:
   ```bash
   npm run tauri build
   ```

## 📖 Usage

1. **Add Workspace**: On the first launch, click "Add Workspace" to select your project root directory.
2. **Scan Projects**: The app will automatically scan for `package.json` files and list projects in the sidebar.
3. **Execute Scripts**: Select a project, then click "Install" to install dependencies or any script button (e.g., `dev`, `build`, `test`) to run it.
4. **View Logs**: Monitor the command output in the real-time log viewer.
5. **Settings**: Click the gear icon to add more workspaces or switch between English and Japanese.

## 📄 License

MIT
