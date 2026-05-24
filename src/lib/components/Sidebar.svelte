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

<div class="w-64 bg-base-200 border-r border-base-300 flex flex-col h-full overflow-hidden shadow-lg z-10">
  <div class="p-4 flex justify-between items-center bg-base-300 shadow-sm">
    <h2 class="font-black uppercase tracking-tighter text-sm text-base-content">{$_('projects')}</h2>
    <button class="btn btn-ghost btn-circle btn-xs" on:click={onRefresh} disabled={isScanning}>
      {#if isScanning}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        🔄
      {/if}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-2">
    <ul class="menu menu-md w-full p-0 gap-1">
      {#each projects as project}
        <li>
          <button
            class="rounded-lg {selectedProjectId === project.id ? 'active bg-primary text-primary-content' : 'hover:bg-base-300'}"
            on:click={() => onSelectProject(project.id)}
          >
            <span class="text-lg">📁</span>
            <span class="truncate font-medium">{project.name}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <div class="p-4 border-t border-base-300 bg-base-300/50">
    <button class="btn btn-block btn-neutral btn-sm shadow-md" on:click={onOpenSettings}>
      ⚙️ {$_('settings')}
    </button>
  </div>
</div>
