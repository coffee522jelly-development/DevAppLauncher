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

<div class="flex flex-col h-full p-6 space-y-6 overflow-hidden">
  <div class="flex flex-col">
    <div class="flex items-center space-x-3">
      <h1 class="text-3xl font-bold">{project.name}</h1>
      <div class="badge badge-primary">{project.packageManager}</div>
    </div>
    <p class="text-sm text-base-content/60 mt-1 truncate">{project.path}</p>
  </div>

  <div class="flex flex-wrap gap-2 py-2">
    <button
      class="btn btn-primary btn-sm"
      disabled={isRunning}
      on:click={handleInstall}
    >
      {$_('install')}
    </button>
    {#each Object.keys(project.scripts) as scriptName}
      <button
        class="btn btn-outline btn-sm"
        disabled={isRunning}
        title={project.scripts[scriptName]}
        on:click={() => handleRunScript(scriptName)}
      >
        {scriptName}
      </button>
    {/each}
  </div>

  {#if isRunning}
    <div class="alert alert-info shadow-lg flex justify-between items-center py-2 px-4">
      <div class="flex items-center space-x-2">
        <span class="loading loading-spinner loading-xs"></span>
        <span class="text-sm">{$_('running')} <code class="bg-base-300 px-1 rounded">{runningCmd}</code></span>
      </div>
      <button class="btn btn-error btn-xs" on:click={() => stopCommand(project.id)}>
        {$_('stop')}
      </button>
    </div>
  {/if}

  <LogViewer {projectLogs} />
</div>
