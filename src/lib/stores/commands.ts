import { writable } from 'svelte/store';
import { Command, type Child } from '@tauri-apps/plugin-shell';
import { type } from '@tauri-apps/plugin-os';
import type { CommandLog } from '../types';
import { _ } from 'svelte-i18n';
import { get } from 'svelte/store';

export const logs = writable<Record<string, CommandLog[]>>({});
export const runningProcesses = writable<Record<string, Child>>({});
export const runningCommands = writable<Record<string, string>>({});

export function appendLog(projectId: string, log: CommandLog) {
  logs.update((prev) => ({
    ...prev,
    [projectId]: [...(prev[projectId] || []), log],
  }));
}

export async function runCommand(projectId: string, cwd: string, program: string, args: string[], mask: string[] = []): Promise<void> {
  return new Promise(async (resolve) => {
    const t = get(_);

    // Handle Windows command extensions
    let actualProgram = program;
    const isWindows = type() === 'windows';
    if (isWindows) {
      if (['npm', 'pnpm', 'yarn', 'git', 'code', 'npx'].includes(program)) {
        actualProgram = (program === 'git') ? 'git' : `${program}.cmd`;
      } else if (program === 'bun') {
        actualProgram = `${program}.exe`;
      }
    }

    let fullCommand = `${actualProgram} ${args.join(' ')}`;
    let displayCommand = fullCommand;

    // Mask sensitive information in logs
    for (const sensitive of mask) {
      if (sensitive) {
        displayCommand = displayCommand.split(sensitive).join('****');
      }
    }

    appendLog(projectId, {
      type: 'info',
      content: `$ ${displayCommand}`,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const command = Command.create(actualProgram, args, { cwd });

      command.on('close', (data) => {
        appendLog(projectId, {
          type: 'info',
          content: `${t('exitCode')} ${data.code}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        runningProcesses.update((prev) => {
          const newState = { ...prev };
          delete newState[projectId];
          return newState;
        });
        runningCommands.update((prev) => {
          const newState = { ...prev };
          delete newState[projectId];
          return newState;
        });
        resolve();
      });

      command.on('error', (error) => {
        appendLog(projectId, {
          type: 'stderr',
          content: error,
          timestamp: new Date().toLocaleTimeString(),
        });
        resolve();
      });

      command.stdout.on('data', (line) => {
        appendLog(projectId, {
          type: 'stdout',
          content: line,
          timestamp: new Date().toLocaleTimeString(),
        });
      });

      command.stderr.on('data', (line) => {
        appendLog(projectId, {
          type: 'stderr',
          content: line,
          timestamp: new Date().toLocaleTimeString(),
        });
      });

      const child = await command.spawn();

      runningProcesses.update((prev) => ({ ...prev, [projectId]: child }));
      runningCommands.update((prev) => ({ ...prev, [projectId]: displayCommand }));
    } catch (error) {
      appendLog(projectId, {
        type: 'stderr',
        content: String(error),
        timestamp: new Date().toLocaleTimeString(),
      });
      resolve();
    }
  });
}

export async function runCustomCommand(projectId: string, cwd: string, commandLine: string) {
  const isWindows = type() === 'windows';
  const program = isWindows ? 'cmd' : 'sh';
  const args = isWindows ? ['/C', commandLine] : ['-c', commandLine];

  await runCommand(projectId, cwd, program, args);
}

export async function stopCommand(projectId: string) {
  const processes = get(runningProcesses);
  const child = processes[projectId];
  if (child) {
    await child.kill();
  }
}

export function clearLogs(projectId: string) {
  logs.update((prev) => ({ ...prev, [projectId]: [] }));
}
