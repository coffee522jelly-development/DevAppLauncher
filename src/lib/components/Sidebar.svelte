<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { Project } from '../types';

  export let projects: Project[] = [];
  export let selectedProjectId: string | undefined;
  export let isScanning = false;

  export let onSelectProject: (id: string) => void;
  export let onRefresh: () => void;
  export let onOpenSettings: () => void;
</script>

<div class="w-64 bg-base-200 border-r border-base-300 flex flex-col h-full overflow-hidden">
  <div class="p-4 flex justify-between items-center border-b border-base-300">
    <h2 class="font-bold uppercase tracking-wider text-xs text-base-content/70">{$_('projects')}</h2>
    <button class="btn btn-ghost btn-xs" on:click={onRefresh} disabled={isScanning}>
      {#if isScanning}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        🔄
      {/if}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-2">
    <ul class="menu w-full p-0">
      {#each projects as project}
        <li>
          <button
            class={selectedProjectId === project.id ? 'active' : ''}
            on:click={() => onSelectProject(project.id)}
          >
            📁 {project.name}
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <div class="p-4 border-t border-base-300">
    <button class="btn btn-block btn-outline btn-sm" on:click={onOpenSettings}>
      ⚙️ {$_('settings')}
    </button>
  </div>
</div>
