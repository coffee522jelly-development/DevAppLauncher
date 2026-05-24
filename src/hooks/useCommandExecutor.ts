import { useState, useCallback } from 'react';
import { Command, Child } from '@tauri-apps/plugin-shell';
import { useTranslation } from 'react-i18next';

export interface CommandLog {
  type: 'stdout' | 'stderr' | 'info';
  content: string;
  timestamp: string;
}

export function useCommandExecutor() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<Record<string, CommandLog[]>>({});
  const [runningProcesses, setRunningProcesses] = useState<Record<string, Child>>({});
  const [runningCommands, setRunningCommands] = useState<Record<string, string>>({});

  const appendLog = useCallback((projectId: string, log: CommandLog) => {
    setLogs((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), log],
    }));
  }, []);

  const runCommand = useCallback(async (projectId: string, cwd: string, program: string, args: string[]) => {
    const fullCommand = `${program} ${args.join(' ')}`;
    appendLog(projectId, {
      type: 'info',
      content: `$ ${fullCommand}`,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const command = Command.create(program, args, { cwd });

      command.on('close', (data) => {
        appendLog(projectId, {
          type: 'info',
          content: `${t('exitCode')} ${data.code}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        setRunningProcesses((prev) => {
          const newState = { ...prev };
          delete newState[projectId];
          return newState;
        });
        setRunningCommands((prev) => {
          const newState = { ...prev };
          delete newState[projectId];
          return newState;
        });
      });

      command.on('error', (error) => {
        appendLog(projectId, {
          type: 'stderr',
          content: error,
          timestamp: new Date().toLocaleTimeString(),
        });
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

      setRunningProcesses((prev) => ({ ...prev, [projectId]: child }));
      setRunningCommands((prev) => ({ ...prev, [projectId]: fullCommand }));
    } catch (error) {
      appendLog(projectId, {
        type: 'stderr',
        content: String(error),
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }, [appendLog, t]);

  const stopCommand = useCallback(async (projectId: string) => {
    const child = runningProcesses[projectId];
    if (child) {
      await child.kill();
      // 'close' event will handle the rest
    }
  }, [runningProcesses]);

  const clearLogs = useCallback((projectId: string) => {
    setLogs((prev) => ({ ...prev, [projectId]: [] }));
  }, []);

  return {
    logs,
    runningProcesses,
    runningCommands,
    runCommand,
    stopCommand,
    clearLogs,
  };
}
