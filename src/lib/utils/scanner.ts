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
  console.log(`Scanning project path: ${path}`);
  const folderName = path.split(/[/\\]/).filter(Boolean).pop() || 'unnamed';
  let scripts: Record<string, string> = {};
  let packageManager: PackageManager = 'npm';
  let isTauri = false;

  try {
    const packageJsonPath = await join(path, 'package.json');
    const hasPackageJson = await exists(packageJsonPath);
    console.log(`- checking package.json at: ${packageJsonPath} (${hasPackageJson})`);

    if (hasPackageJson) {
      try {
        const content = await readTextFile(packageJsonPath);
        const pkg = JSON.parse(content);
        scripts = pkg.scripts || {};
        packageManager = await detectPackageManager(path);
        console.log(`- package manager: ${packageManager}, scripts count: ${Object.keys(scripts).length}`);
      } catch (parseError) {
        console.error(`- Failed to parse package.json at ${packageJsonPath}:`, parseError);
      }
    }

    const tauriDirPath = await join(path, 'src-tauri');
    isTauri = await exists(tauriDirPath);
    console.log(`- is tauri project: ${isTauri}`);
  } catch (e) {
    console.error(`Error processing project at ${path}:`, e);
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
