<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { Project } from '../types';
  import { runCommand, stopCommand, runningProcesses, runningCommands, logs, appendLog } from '../stores/commands';
  import LogViewer from './LogViewer.svelte';

  export let project: Project;
  export let gitServerUrl: string = '';
  export let gitUsername: string = '';
  export let gitToken: string = '';

  $: isRunning = !!$runningProcesses[project.id];
  $: runningCmd = $runningCommands[project.id];
  $: projectLogs = $logs[project.id] || [];

  function handleInstall() {
    const cmd = project.packageManager;
    const args = cmd === 'yarn' ? [] : ['install'];
    runCommand(project.id, project.path, cmd, args);
  }

  function handleRunScript(scriptName: string) {
    runCommand(project.id, project.path, project.packageManager, ['run', scriptName]);
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
        // Fallback for non-standard URLs
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
      content: `Attempting to link with ${repoUrl.replace(gitToken, '****')}...`,
      timestamp: new Date().toLocaleTimeString(),
    });

    await runCommand(project.id, project.path, 'git', ['init']);
    setTimeout(async () => {
      // Use authenticated URL for remote
      await runCommand(project.id, project.path, 'git', ['remote', 'remove', 'origin']).catch(() => {});
      await runCommand(project.id, project.path, 'git', ['remote', 'add', 'origin', repoUrl]);
      setTimeout(async () => {
        await runCommand(project.id, project.path, 'git', ['fetch', 'origin']);
      }, 500);
    }, 500);
  }

  async function handleGitPush() {
    const repoUrl = getAuthenticatedUrl();
    if (repoUrl) {
      // Update remote URL just in case credentials changed
      await runCommand(project.id, project.path, 'git', ['remote', 'set-url', 'origin', repoUrl]);
    }
    runCommand(project.id, project.path, 'git', ['push', 'origin', 'HEAD']);
  }
</script>

<div class="flex flex-col h-full p-6 space-y-6 overflow-hidden bg-base-100 text-base-content">
  <div class="flex flex-col border-b border-base-300 pb-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h1 class="text-2xl font-bold">{project.name}</h1>
        <div class="badge badge-primary badge-outline">{project.packageManager}</div>
      </div>
    </div>
    <div class="text-xs opacity-50 mt-1 font-mono bg-base-200 p-1 rounded inline-block truncate">
      {project.path}
    </div>
  </div>

  <div class="space-y-4 flex-none">
    <div class="flex flex-wrap gap-2 items-center">
      <div class="join">
        <button
          class="btn btn-primary btn-sm join-item"
          disabled={isRunning}
          on:click={handleInstall}
        >
          📥 {$_('install')}
        </button>
      </div>

      <div class="divider divider-horizontal mx-0"></div>

      <div class="join">
        {#each Object.keys(project.scripts) as scriptName}
          <button
            class="btn btn-outline btn-sm btn-secondary join-item"
            disabled={isRunning}
            title={project.scripts[scriptName]}
            on:click={() => handleRunScript(scriptName)}
          >
            {scriptName}
          </button>
        {/each}
      </div>

      <div class="divider divider-horizontal mx-0"></div>

      <div class="join">
        <button
          class="btn btn-sm btn-accent join-item"
          disabled={isRunning || !gitServerUrl}
          on:click={handleGitClone}
          title={gitServerUrl ? `Link with ${gitServerUrl}` : 'Set Git Server URL in settings'}
        >
          🐙 {$_('gitClone')}
        </button>
        <button
          class="btn btn-sm btn-accent join-item"
          disabled={isRunning}
          on:click={handleGitPush}
        >
          ⬆️ {$_('gitPush')}
        </button>
      </div>
    </div>
  </div>

  <div class="flex-1 flex flex-col min-h-0">
    {#if isRunning}
      <div class="alert alert-info shadow-sm flex justify-between items-center py-2 px-4 mb-4 rounded-lg border-l-4">
        <div class="flex items-center space-x-3">
          <span class="loading loading-spinner loading-xs text-info"></span>
          <div class="flex flex-col">
            <span class="text-xs font-bold uppercase opacity-70">{$_('running')}</span>
            <code class="text-xs">{runningCmd}</code>
          </div>
        </div>
        <button class="btn btn-error btn-xs" on:click={() => stopCommand(project.id)}>
          {$_('stop')}
        </button>
      </div>
    {/if}

    <LogViewer {projectLogs} />
  </div>
</div>
