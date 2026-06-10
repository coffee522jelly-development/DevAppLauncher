<script lang="ts">
  import { onMount } from 'svelte';
  import { Command } from '@tauri-apps/plugin-shell';
  import { type } from '@tauri-apps/plugin-os';
  import { _ } from 'svelte-i18n';
  import {
    Monitor,
    CheckCircle2,
    XCircle,
    Loader2,
    Download,
    Info,
    RefreshCw,
    Terminal
  } from 'lucide-svelte';
  import { Button } from './ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
  import { Badge } from './ui/badge';
  import { Alert, AlertDescription, AlertTitle } from './ui/alert';
  import { cn } from '$lib/utils';
  import { appendLog, logs } from '../stores/commands';
  import LogViewer from './LogViewer.svelte';

  type Status = 'unknown' | 'installed' | 'missing' | 'checking';

  interface Tool {
    id: string;
    name: string;
    description: string;
    checkCmd: string;
    checkArgs: string[];
    installCmd?: string;
    installArgs?: string[];
    status: Status;
    version?: string;
  }

  let tools: Tool[] = $state([
    {
      id: 'node',
      name: 'Node.js',
      description: 'JavaScript runtime built on Chrome\'s V8 engine.',
      checkCmd: 'node',
      checkArgs: ['-v'],
      installCmd: 'winget',
      installArgs: ['install', 'OpenJS.NodeJS.LTS'],
      status: 'unknown'
    },
    {
      id: 'rust',
      name: 'Rust',
      description: 'Safe, fast, and concurrent systems programming language.',
      checkCmd: 'rustc',
      checkArgs: ['--version'],
      installCmd: 'powershell',
      installArgs: ['-Command', 'iwr -useb https://sh.rustup.rs | iex'],
      status: 'unknown'
    },
    {
      id: 'msvc',
      name: 'MSVC C++ Build Tools',
      description: 'Required components for compiling Rust/Tauri on Windows. Note: May show missing if not in system PATH.',
      checkCmd: 'cl',
      checkArgs: ['-help'],
      installCmd: 'winget',
      installArgs: ['install', 'Microsoft.VisualStudio.2022.BuildTools', '--override', '"--add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --passive --norestart"'],
      status: 'unknown'
    },
    {
      id: 'tauri-cli',
      name: 'Tauri CLI',
      description: 'CLI tool to build and package Tauri applications.',
      checkCmd: 'npm',
      checkArgs: ['list', '-g', '@tauri-apps/cli'],
      installCmd: 'npm',
      installArgs: ['install', '-g', '@tauri-apps/cli@latest'],
      status: 'unknown'
    }
  ]);

  let isWindows = $state(type() === 'windows');

  async function checkStatus(tool: Tool) {
    tool.status = 'checking';
    try {
      let program = tool.checkCmd;
      if (isWindows) {
        // Node, Rust, and Git (usually) are .exe or internal,
        // while npm/pnpm/yarn are .cmd
        if (['npm', 'pnpm', 'yarn'].includes(program)) {
          program = `${program}.cmd`;
        }
      }

      console.log(`Checking ${tool.name} using ${program} ${tool.checkArgs.join(' ')}`);
      const cmd = Command.create(program, tool.checkArgs);
      const output = await cmd.execute();

      console.log(`- ${tool.name} check output code: ${output.code}`);

      if (output.code === 0) {
        tool.status = 'installed';
        const versionMatch = (output.stdout || output.stderr).trim().split('\n')[0];
        tool.version = versionMatch;
      } else {
        console.warn(`- ${tool.name} check failed:`, output.stderr || output.stdout);
        tool.status = 'missing';
      }
    } catch (e) {
      console.error(`- ${tool.name} check error:`, e);
      tool.status = 'missing';
    }
  }

  async function installTool(tool: Tool) {
    if (!tool.installCmd) return;

    appendLog('setup', {
      type: 'info',
      content: `Installing ${tool.name}...`,
      timestamp: new Date().toLocaleTimeString()
    });

    try {
      let program = tool.installCmd;
      if (isWindows && program === 'npm') {
        program = 'npm.cmd';
      }

      const cmd = Command.create(program, tool.installArgs || []);

      cmd.stdout.on('data', (line) => {
        appendLog('setup', { type: 'stdout', content: line, timestamp: new Date().toLocaleTimeString() });
      });

      cmd.stderr.on('data', (line) => {
        appendLog('setup', { type: 'stderr', content: line, timestamp: new Date().toLocaleTimeString() });
      });

      const child = await cmd.spawn();
      // Since we don't have a specific project context for setup logs,
      // we might want a global setup project ID or similar.
      // For now, we'll just check status again after some time.

      setTimeout(() => checkStatus(tool), 10000); // Check after 10s
    } catch (e) {
      appendLog('setup', { type: 'stderr', content: String(e), timestamp: new Date().toLocaleTimeString() });
    }
  }

  function checkAll() {
    tools.forEach(checkStatus);
  }

  onMount(() => {
    checkAll();
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="space-y-1">
      <h3 class="text-lg font-bold tracking-tight">Environment Setup</h3>
      <p class="text-sm text-muted-foreground">Check and install required tools for development.</p>
    </div>
    <Button variant="outline" size="sm" onclick={checkAll} class="gap-2">
      <RefreshCw class="h-4 w-4" />
      Refresh Status
    </Button>
  </div>

  {#if !isWindows}
    <Alert>
      <Info class="h-4 w-4" />
      <AlertTitle>OS Compatibility</AlertTitle>
      <AlertDescription>
        The setup wizard is currently optimized for Windows. Some commands may not work on your OS.
      </AlertDescription>
    </Alert>
  {/if}

  <div class="grid gap-4">
    {#each tools as tool}
      <Card>
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-md flex items-center gap-2">
              {tool.name}
              {#if tool.status === 'installed'}
                <CheckCircle2 class="h-4 w-4 text-green-500" />
              {:else if tool.status === 'missing'}
                <XCircle class="h-4 w-4 text-destructive" />
              {:else if tool.status === 'checking'}
                <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
              {/if}
            </CardTitle>
            <Badge variant={tool.status === 'installed' ? 'secondary' : tool.status === 'missing' ? 'destructive' : 'outline'}>
              {tool.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground">{tool.description}</p>
              {#if tool.version}
                <code class="text-[10px] bg-muted px-1 rounded">{tool.version}</code>
              {/if}
            </div>

            <div class="flex gap-2 shrink-0">
              {#if tool.status === 'missing' && tool.installCmd}
                <Button size="sm" class="gap-2" onclick={() => installTool(tool)}>
                  <Download class="h-4 w-4" />
                  Install
                </Button>
              {/if}
              <Button variant="ghost" size="sm" onclick={() => checkStatus(tool)}>
                <RefreshCw class="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>

  <div class="flex-1 min-h-[300px]">
    <LogViewer projectLogs={$logs['setup'] || []} />
  </div>
</div>
