<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { Terminal, Clock, CheckCircle2, AlertCircle } from 'lucide-svelte';
  import type { CommandLog } from '../types';
  import { ScrollArea } from './ui/scroll-area';
  import { cn } from '$lib/utils';

  let { projectLogs }: { projectLogs: CommandLog[] } = $props();

  let scrollViewport = $state<HTMLElement>();

  $effect(() => {
    if (projectLogs && scrollViewport) {
      scrollViewport.scrollTo({ top: scrollViewport.scrollHeight, behavior: 'smooth' });
    }
  });
</script>

<div class="flex-1 flex flex-col min-h-0 bg-zinc-950 font-mono text-sm selection:bg-sky-500/30">
  <div class="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
    <Terminal class="h-3 w-3" />
    <span>Console Output</span>
  </div>

  <div class="flex-1 overflow-auto p-4 custom-scrollbar" bind:this={scrollViewport}>
    {#if projectLogs.length === 0}
      <div class="h-full flex flex-col items-center justify-center text-zinc-700 space-y-2">
        <Terminal class="h-8 w-8 opacity-20" />
        <p class="text-xs italic opacity-40">Waiting for output...</p>
      </div>
    {:else}
      <div class="space-y-1">
        {#each projectLogs as log}
          <div class="group flex gap-3 leading-relaxed animate-in fade-in slide-in-from-left-1 duration-200">
            <span class="text-[10px] text-zinc-600 tabular-nums pt-1 select-none w-16 shrink-0">
              [{log.timestamp}]
            </span>

            <div class={cn(
              "whitespace-pre-wrap break-all flex-1",
              log.type === 'stderr' ? "text-rose-400" :
              log.type === 'info' ? "text-sky-400 font-bold" :
              "text-zinc-300"
            )}>
              {#if log.type === 'info' && log.content.startsWith('$')}
                <span class="text-zinc-500 mr-2 opacity-50">❯</span>
              {/if}
              {log.content}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #27272a;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3f3f46;
  }
</style>
