<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { Project } from '../types';
  import { runCommand, stopCommand, runningProcesses, runningCommands, logs } from '../stores/commands';
  import LogViewer from './LogViewer.svelte';

  export let project: Project;

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
</script>

<div class="flex flex-col h-full p-6 space-y-6 overflow-hidden bg-base-100">
  <div class="flex flex-col border-b border-base-300 pb-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h1 class="text-2xl font-bold text-base-content">{project.name}</h1>
        <div class="badge badge-primary badge-outline">{project.packageManager}</div>
      </div>
    </div>
    <div class="text-xs text-base-content/50 mt-1 font-mono bg-base-200 p-1 rounded inline-block truncate">
      {project.path}
    </div>
  </div>

  <div class="space-y-4 flex-none">
    <div class="flex flex-wrap gap-2">
      <button
        class="btn btn-primary btn-sm"
        disabled={isRunning}
        on:click={handleInstall}
      >
        <span class="icon">📥</span> {$_('install')}
      </button>

      <div class="divider divider-horizontal mx-0"></div>

      {#each Object.keys(project.scripts) as scriptName}
        <button
          class="btn btn-outline btn-sm btn-secondary"
          disabled={isRunning}
          title={project.scripts[scriptName]}
          on:click={() => handleRunScript(scriptName)}
        >
          {scriptName}
        </button>
      {/each}
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
