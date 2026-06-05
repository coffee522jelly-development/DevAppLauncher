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
  console.log(`Starting workspace scan at: ${rootPath}`);
  const projects: Project[] = [];

  try {
    // 1. Check if the root path itself is a project
    const rootProject = await createProjectFromPath(rootPath);
    if (Object.keys(rootProject.scripts).length > 0) {
      projects.push(rootProject);
    }

    // 2. Scan immediate subdirectories
    const entries = await readDir(rootPath);
    for (const entry of entries) {
      if (entry.isDirectory && !IGNORED_DIRS.includes(entry.name)) {
        const subPath = await join(rootPath, entry.name);
        const subProject = await createProjectFromPath(subPath);
        // Only add if it actually has scripts (valid Node.js project)
        if (Object.keys(subProject.scripts).length > 0) {
          projects.push(subProject);
        }
      }
    }
  } catch (e) {
    console.error(`Failed to scan workspace ${rootPath}`, e);
  }

  console.log(`Scan finished for ${rootPath}. Found ${projects.length} valid project(s).`);
  return projects;
}
