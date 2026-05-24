import { readDir, readFile, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { Project, PackageManager } from '../types';

const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.next', '.nuxt', '.git', 'coverage', 'target'];
const MAX_DEPTH = 3;

async function detectPackageManager(projectPath: string): Promise<PackageManager> {
  if (await exists(await join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await exists(await join(projectPath, 'yarn.lock'))) return 'yarn';
  if (await exists(await join(projectPath, 'bun.lockb'))) return 'bun';
  return 'npm';
}

export async function scanWorkspace(rootPath: string, depth = 0): Promise<Project[]> {
  if (depth > MAX_DEPTH) return [];

  const projects: Project[] = [];
  try {
    const entries = await readDir(rootPath);

    // Check if current directory is a project
    const packageJsonPath = await join(rootPath, 'package.json');
    if (await exists(packageJsonPath)) {
      try {
        const content = await readFile(packageJsonPath);
        const pkg = JSON.parse(new TextDecoder().decode(content));

        const project: Project = {
          id: rootPath,
          name: pkg.name || rootPath.split(/[/\\]/).pop() || 'unnamed',
          path: rootPath,
          packageManager: await detectPackageManager(rootPath),
          scripts: pkg.scripts || {},
        };
        projects.push(project);
      } catch (e) {
        console.error(`Failed to parse package.json at ${rootPath}`, e);
      }
    }

    // Recursively scan subdirectories
    for (const entry of entries) {
      if (entry.isDirectory && !IGNORED_DIRS.includes(entry.name)) {
        const subPath = await join(rootPath, entry.name);
        const subProjects = await scanWorkspace(subPath, depth + 1);
        projects.push(...subProjects);
      }
    }
  } catch (e) {
    console.error(`Failed to scan directory ${rootPath}`, e);
  }

  return projects;
}
