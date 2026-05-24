<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import type { CommandLog } from '../types';

  export let projectLogs: CommandLog[] = [];
  let logEnd: HTMLDivElement;

  function scrollToBottom() {
    if (logEnd) {
      logEnd.scrollIntoView({ behavior: 'smooth' });
    }
  }

  afterUpdate(scrollToBottom);
</script>

<div class="flex-1 bg-neutral text-neutral-content font-mono text-xs p-4 overflow-y-auto rounded-box shadow-inner border border-base-300">
  {#if projectLogs.length === 0}
    <div class="h-full flex items-center justify-center text-neutral-content/30 italic">
      No logs to display
    </div>
  {/if}
  {#each projectLogs as log}
    <div class="mb-1 break-all flex">
      <span class="text-neutral-content/40 mr-2 shrink-0">[{log.timestamp}]</span>
      <span class={
        log.type === 'stderr' ? 'text-error' :
        log.type === 'info' ? 'text-info font-bold' :
        'text-neutral-content/90'
      }>
        {log.content}
      </span>
    </div>
  {/each}
  <div bind:this={logEnd}></div>
</div>
