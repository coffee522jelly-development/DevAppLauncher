<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { revealItemInDir } from '@tauri-apps/plugin-opener';
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
  $: hasScripts = Object.keys(project.scripts).length > 0;

  function handleInstall() {
    const cmd = project.packageManager;
    const args = cmd === 'yarn' ? [] : ['install'];
    runCommand(project.id, project.path, cmd, args);
  }

  function handleRunScript(scriptName: string) {
    // If scriptName contains spaces (like 'tauri dev'), split it so args are passed correctly
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
    const args = project.packageManager === 'npm' ? ['outdated'] : ['outdated'];
    runCommand(project.id, project.path, project.packageManager, args);
  }

  function handlePreview() {
    runCommand(project.id, project.path, 'npx', ['serve', 'build', '-p', '5000']);
  }
</script>

<div class="flex flex-col h-full p-6 space-y-6 overflow-hidden bg-base-100 text-base-content">
  <div class="flex flex-col border-b border-base-300 pb-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h1 class="text-2xl font-bold">{project.name}</h1>
        <div class="badge badge-primary badge-outline">{project.packageManager}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-sm tooltip tooltip-left" data-tip={$_('openVSCode')} on:click={handleOpenVSCode}>
          <span class="text-xl">⌨️</span>
        </button>
        <button class="btn btn-ghost btn-sm tooltip tooltip-left" data-tip={$_('openFolder')} on:click={handleOpenFolder}>
          <span class="text-xl">📂</span>
        </button>
      </div>
    </div>
    <div class="text-xs opacity-50 mt-1 font-mono bg-base-200 p-1 rounded inline-block truncate">
      {project.path}
    </div>
  </div>

  <div class="space-y-4 flex-none">
    <div class="flex flex-wrap gap-2 items-center">
      {#if hasScripts || project.packageManager}
        <div class="join">
          <button
            class="btn btn-primary btn-sm join-item"
            disabled={isRunning}
            on:click={handleInstall}
          >
            📥 {$_('install')}
          </button>
        </div>
      {/if}

      {#if hasScripts || project.isTauri}
        <div class="divider divider-horizontal mx-0"></div>
        <div class="flex flex-wrap gap-1">
          {#if project.isTauri}
            <div class="join mr-1">
              <button
                class="btn btn-info btn-sm join-item"
                disabled={isRunning}
                on:click={() => handleRunScript('tauri dev')}
              >
                🚀 tauri dev
              </button>
              <button
                class="btn btn-info btn-sm join-item"
                disabled={isRunning}
                on:click={() => handleRunScript('tauri build')}
              >
                🏗️ tauri build
              </button>
            </div>
          {/if}

          <div class="join flex-wrap">
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
        </div>
      {/if}

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

      <div class="divider divider-horizontal mx-0"></div>

      <div class="join">
        <button class="btn btn-sm btn-neutral join-item" disabled={isRunning} on:click={handleAuditFix} title="audit fix">
          🛡️ Audit
        </button>
        <button class="btn btn-sm btn-neutral join-item" disabled={isRunning} on:click={handleCheckUpdates} title="outdated">
          🆙 Updates
        </button>
        <button class="btn btn-sm btn-neutral join-item" disabled={isRunning} on:click={handlePreview} title="npx serve">
          🌐 Preview
        </button>
      </div>
    </div>
  </div>

  <div class="flex-1 flex flex-col min-h-0">
    {#if isRunning}
      <div class="alert alert-info shadow-sm flex justify-between items-center py-2 px-4 mb-4 rounded-lg border-l-4 border-info">
        <div class="flex items-center space-x-3">
          <span class="loading loading-spinner loading-xs text-info"></span>
          <div class="flex flex-col text-info-content">
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
