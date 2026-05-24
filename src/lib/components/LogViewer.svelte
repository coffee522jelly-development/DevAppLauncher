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

<div class="flex-1 bg-black text-white font-mono text-sm p-4 overflow-y-auto rounded-lg shadow-inner">
  {#each projectLogs as log}
    <div class="mb-1 break-all">
      <span class="text-gray-500 mr-2">[{log.timestamp}]</span>
      <span class={
        log.type === 'stderr' ? 'text-error' :
        log.type === 'info' ? 'text-info font-bold' :
        'text-gray-300'
      }>
        {log.content}
      </span>
    </div>
  {/each}
  <div bind:this={logEnd}></div>
</div>
