import { readDir, readTextFile, exists } from '@tauri-apps/plugin-fs';
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
  console.log(`[Scanner] Processing path: ${path}`);
  const folderName = path.split(/[/\\]/).filter(Boolean).pop() || 'unnamed';
  let scripts: Record<string, string> = {};
  let packageManager: PackageManager = 'npm';
  let isTauri = false;
  let error: string | undefined;

  try {
    const packageJsonPath = await join(path, 'package.json');
    console.log(`[Scanner] Checking package.json at: ${packageJsonPath}`);
    const hasPackageJson = await exists(packageJsonPath);
    console.log(`[Scanner] package.json exists: ${hasPackageJson}`);

    if (hasPackageJson) {
      try {
        const content = await readTextFile(packageJsonPath);
        const pkg = JSON.parse(content);
        scripts = pkg.scripts || {};
        packageManager = await detectPackageManager(path);
        console.log(`[Scanner] Found scripts: ${Object.keys(scripts).join(', ')}`);
      } catch (parseError: any) {
        error = `Failed to parse package.json: ${parseError.message}`;
        console.error(`[Scanner] !!! Parse error at ${packageJsonPath}:`, parseError);
      }
    }

    const tauriDirPath = await join(path, 'src-tauri');
    isTauri = await exists(tauriDirPath);
  } catch (e: any) {
    error = e.message || String(e);
    console.error(`[Scanner] !!! CRITICAL Error processing project at ${path}:`, {
      message: e.message,
      stack: e.stack,
      raw: e
    });
  }

  return {
    id: path,
    name: folderName,
    path: path,
    packageManager,
    scripts,
    isTauri,
    error,
    isLoading: false
  };
}

export async function scanWorkspace(rootPath: string): Promise<Project[]> {
  const projects: Project[] = [];

  try {
    // 1. Root path itself is always a project (even if it has error)
    projects.push(await createProjectFromPath(rootPath));

    // 2. Scan immediate subdirectories
    const entries = await readDir(rootPath);
    for (const entry of entries) {
      if (entry.isDirectory && !IGNORED_DIRS.includes(entry.name)) {
        const subPath = await join(rootPath, entry.name);
        const project = await createProjectFromPath(subPath);

        // Add if it has a package.json OR it's a directory we might want to link
        // For subdirectories, we only add if they look like projects (have scripts)
        // to avoid too much noise.
        if (Object.keys(project.scripts).length > 0) {
          projects.push(project);
        }
      }
    }
  } catch (e) {
    console.error(`Failed to scan workspace ${rootPath}`, e);
  }

  return projects;
}
