<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { revealItemInDir } from '@tauri-apps/plugin-opener';
  import {
    Play,
    Square,
    Download,
    GitBranch,
    Send,
    ShieldCheck,
    ArrowUpCircle,
    ExternalLink,
    Monitor,
    Keyboard,
    Folder,
    Terminal,
    History,
    RefreshCw
  } from 'lucide-svelte';
  import type { Project } from '../types';
  import { runCommand, runCustomCommand, stopCommand, runningProcesses, runningCommands, logs, appendLog } from '../stores/commands';
  import LogViewer from './LogViewer.svelte';
  import { Button } from './ui/button';
  import { Badge } from './ui/badge';
  import { Input } from './ui/input';
  import { Separator } from './ui/separator';
  import { ScrollArea } from './ui/scroll-area';
  import * as Tooltip from './ui/tooltip';

  let { project, gitServerUrl = '', gitUsername = '', gitToken = '', onRefresh }: {
    project: Project,
    gitServerUrl?: string,
    gitUsername?: string,
    gitToken?: string,
    onRefresh: () => void
  } = $props();

  let isRunning = $derived(!!$runningProcesses[project.id]);
  let runningCmd = $derived($runningCommands[project.id]);
  let projectLogs = $derived($logs[project.id] || []);
  let hasScripts = $derived(Object.keys(project.scripts).length > 0);

  function handleInstall() {
    const cmd = project.packageManager;
    const args = cmd === 'yarn' ? [] : ['install'];
    runCommand(project.id, project.path, cmd, args);
  }

  function handleRunScript(scriptName: string) {
    const scriptArgs = scriptName.split(' ');
    runCommand(project.id, project.path, project.packageManager, ['run', ...scriptArgs]);
  }

  function getAuthenticatedUrl() {
    if (!gitServerUrl) return null;
    let baseUrl = gitServerUrl.replace(/\/$/, '');
    const repoUrl = `${baseUrl}/${project.name}.git`;
    if (gitUsername && gitToken) {
      try {
        const url = new URL(repoUrl);
        url.username = gitUsername;
        url.password = gitToken;
        return url.toString();
      } catch (e) {
        if (repoUrl.startsWith('https://')) {
          return repoUrl.replace('https://', `https://${gitUsername}:${gitToken}@`);
        }
      }
    }
    return repoUrl;
  }

  async function handleGitClone() {
    const repoUrl = getAuthenticatedUrl();
    if (!repoUrl) return;
    appendLog(project.id, {
      type: 'info',
      content: `Linking with ${repoUrl.split('@').pop()?.replace(gitToken, '****')}...`,
      timestamp: new Date().toLocaleTimeString(),
    });
    const mask = [gitToken];
    await runCommand(project.id, project.path, 'git', ['init'], mask);
    setTimeout(async () => {
      await runCommand(project.id, project.path, 'git', ['remote', 'remove', 'origin'], mask).catch(() => {});
      await runCommand(project.id, project.path, 'git', ['remote', 'add', 'origin', repoUrl], mask);
      setTimeout(async () => {
        await runCommand(project.id, project.path, 'git', ['fetch', 'origin'], mask);
      }, 500);
    }, 500);
  }

  async function handleGitPush() {
    const repoUrl = getAuthenticatedUrl();
    const mask = [gitToken];
    if (repoUrl) {
      await runCommand(project.id, project.path, 'git', ['remote', 'set-url', 'origin', repoUrl], mask);
    }
    runCommand(project.id, project.path, 'git', ['push', 'origin', 'HEAD'], mask);
  }

  function handleOpenFolder() {
    revealItemInDir(project.path);
  }

  function handleOpenVSCode() {
    runCommand(project.id, project.path, 'code', ['.']);
  }

  function handleAuditFix() {
    const args = project.packageManager === 'npm' ? ['audit', 'fix'] : ['audit'];
    runCommand(project.id, project.path, project.packageManager, args);
  }

  function handleCheckUpdates() {
    runCommand(project.id, project.path, project.packageManager, ['outdated']);
  }

  function handlePreview() {
    runCommand(project.id, project.path, 'npx', ['serve', 'build', '-p', '5000']);
  }

  let customCommand = $state('');
  let recentCommands: string[] = $state([]);

  $effect(() => {
    recentCommands = JSON.parse(localStorage.getItem(`recent_${project.id}`) || '[]');
  });

  function handleCustomCommand() {
    if (!customCommand.trim()) return;
    runCustomCommand(project.id, project.path, customCommand);
    const updated = [customCommand, ...recentCommands.filter(c => c !== customCommand)].slice(0, 5);
    recentCommands = updated;
    localStorage.setItem(`recent_${project.id}`, JSON.stringify(updated));
    customCommand = '';
  }
</script>

<div class="flex flex-col h-full bg-background text-foreground overflow-hidden">
  <!-- Header -->
  <header class="p-6 border-b bg-card">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge variant="outline" class="font-mono uppercase px-2 py-0">{project.packageManager}</Badge>
          {#if project.isTauri}
            <Badge variant="secondary" class="font-bold">TAURI</Badge>
          {/if}
        </div>
        <p class="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
          {project.path}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon" onclick={onRefresh} title={$_('refreshProjects')}>
          <RefreshCw class="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onclick={handleOpenVSCode} title={$_('openVSCode')}>
          <Keyboard class="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onclick={handleOpenFolder} title={$_('openFolder')}>
          <Folder class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </header>

  <!-- Toolbar -->
  <div class="px-6 py-4 bg-muted border-b flex flex-wrap gap-4 items-center">
    <div class="flex items-center gap-2">
      <Button size="sm" class="gap-2" disabled={isRunning} onclick={handleInstall}>
        <Download class="h-4 w-4" />
        {$_('install')}
      </Button>
    </div>

    <Separator orientation="vertical" class="h-8" />

    <div class="flex items-center gap-2">
      {#if project.isTauri}
        <Button variant="outline" size="sm" class="border-blue-500/50 hover:bg-blue-500/10 gap-2" disabled={isRunning} onclick={() => handleRunScript('tauri dev')}>
          <Play class="h-4 w-4 text-blue-500" />
          tauri dev
        </Button>
        <Button variant="outline" size="sm" class="border-blue-500/50 hover:bg-blue-500/10 gap-2" disabled={isRunning} onclick={() => handleRunScript('tauri build')}>
          <Monitor class="h-4 w-4 text-blue-500" />
          tauri build
        </Button>
      {/if}

      <div class="flex flex-wrap gap-1">
        {#each Object.keys(project.scripts).filter(s => s !== 'tauri') as scriptName}
          <Button variant="outline" size="sm" disabled={isRunning} onclick={() => handleRunScript(scriptName)}>
            {scriptName}
          </Button>
        {/each}
      </div>
    </div>

    <Separator orientation="vertical" class="h-8" />

    <div class="flex items-center gap-2">
      <Button variant="secondary" size="sm" class="gap-2" disabled={isRunning || !gitServerUrl} onclick={handleGitClone}>
        <GitBranch class="h-4 w-4" />
        {$_('gitClone')}
      </Button>
      <Button variant="secondary" size="sm" class="gap-2" disabled={isRunning} onclick={handleGitPush}>
        <Send class="h-4 w-4" />
        {$_('gitPush')}
      </Button>
    </div>

    <Separator orientation="vertical" class="h-8" />

    <div class="flex items-center gap-2">
      <Button variant="ghost" size="sm" class="gap-2" disabled={isRunning} onclick={handleAuditFix}>
        <ShieldCheck class="h-4 w-4" />
        Audit
      </Button>
      <Button variant="ghost" size="sm" class="gap-2" disabled={isRunning} onclick={handleCheckUpdates}>
        <ArrowUpCircle class="h-4 w-4" />
        Updates
      </Button>
      <Button variant="ghost" size="sm" class="gap-2" disabled={isRunning} onclick={handlePreview}>
        <ExternalLink class="h-4 w-4" />
        Preview
      </Button>
    </div>
  </div>

  <!-- Content Area (Logs) -->
  <div class="flex-1 min-h-0 flex flex-col relative bg-zinc-950">
    {#if isRunning}
      <div class="absolute top-4 right-4 z-20 flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-2xl">
        <div class="flex items-center gap-2 px-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span class="text-xs font-bold text-sky-400 uppercase tracking-widest">{$_('running')}</span>
          <code class="text-[10px] text-zinc-400 max-w-[200px] truncate">{runningCmd}</code>
        </div>
        <Button variant="destructive" size="sm" class="h-7 px-3" onclick={() => stopCommand(project.id)}>
          <Square class="h-3 w-3 mr-1" />
          {$_('stop')}
        </Button>
      </div>
    {/if}

    <LogViewer {projectLogs} />
  </div>

  <!-- Footer / Custom Command -->
  <footer class="p-4 border-t bg-card">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-muted-foreground">
          <Terminal class="h-3 w-3" />
          <span class="text-[10px] font-bold uppercase tracking-widest">{$_('customCommand')}</span>
        </div>
        {#if recentCommands.length > 0}
          <div class="flex items-center gap-2">
            <History class="h-3 w-3 text-muted-foreground/50" />
            <div class="flex gap-1">
              {#each recentCommands as cmd}
                <button
                  type="button"
                  class="text-[10px] font-mono px-2 py-0.5 rounded hover:bg-muted transition-colors opacity-60 hover:opacity-100"
                  onclick={() => customCommand = cmd}
                >
                  {cmd}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      <div class="flex gap-2">
        <Input
          bind:value={customCommand}
          placeholder="e.g. npm install -D tauri-icon"
          class="font-mono text-xs h-8"
          onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleCustomCommand()}
        />
        <Button size="sm" class="h-8 px-4" disabled={isRunning || !customCommand.trim()} onclick={handleCustomCommand}>
          {$_('run')}
        </Button>
      </div>
    </div>
  </footer>
</div>
