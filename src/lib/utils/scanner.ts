import { readDir, readFile, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import type { Project, PackageManager } from '../types';

const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.next', '.nuxt', '.git', 'coverage', 'target', '.svelte-kit', '.tauri'];

async function detectPackageManager(projectPath: string): Promise<PackageManager> {
  if (await exists(await join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await exists(await join(projectPath, 'yarn.lock'))) return 'yarn';
  if (await exists(await join(projectPath, 'bun.lockb'))) return 'bun';
  return 'npm';
}

async function createProjectFromPath(path: string): Promise<Project> {
  const folderName = path.split(/[/\\]/).filter(Boolean).pop() || 'unnamed';
  let scripts: Record<string, string> = {};
  let packageManager: PackageManager = 'npm';
  let isTauri = false;

  try {
    const packageJsonPath = await join(path, 'package.json');
    if (await exists(packageJsonPath)) {
      const content = await readFile(packageJsonPath);
      const pkg = JSON.parse(new TextDecoder().decode(content));
      scripts = pkg.scripts || {};
      packageManager = await detectPackageManager(path);
    }

    const tauriDirPath = await join(path, 'src-tauri');
    isTauri = await exists(tauriDirPath);
  } catch (e) {
    // Ignore errors, return project with empty scripts
  }

  return {
    id: path,
    name: folderName, // Prioritize folder name
    path: path,
    packageManager,
    scripts,
    isTauri,
  };
}

export async function scanWorkspace(rootPath: string): Promise<Project[]> {
  try {
    // Only return the root path as a project.
    // This simplifies the UI to only show explicitly added workspace roots.
    return [await createProjectFromPath(rootPath)];
  } catch (e) {
    console.error(`Failed to scan workspace ${rootPath}`, e);
    return [];
  }
}
