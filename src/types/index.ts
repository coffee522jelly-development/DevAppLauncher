export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface Project {
  id: string;
  name: string;
  path: string;
  packageManager: PackageManager;
  scripts: Record<string, string>;
}

export interface RunningProcess {
  projectId: string;
  command: string;
  startedAt: string;
}

export interface AppState {
  workspaceRoot: string;
  projects: Project[];
  selectedProjectId?: string;
  language: string;
}
