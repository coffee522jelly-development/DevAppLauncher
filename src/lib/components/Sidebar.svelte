<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { Folder, RefreshCw, Settings as SettingsIcon } from 'lucide-svelte';
  import type { Project } from '../types';
  import { Button } from './ui/button';
  import { cn } from '$lib/utils';

  let {
    projects = [],
    selectedProjectId,
    isScanning = false,
    onSelectProject,
    onRefresh,
    onOpenSettings
  }: {
    projects?: Project[],
    selectedProjectId?: string,
    isScanning?: boolean,
    onSelectProject: (id: string) => void,
    onRefresh: () => void,
    onOpenSettings: () => void
  } = $props();
</script>

<aside class="w-64 border-r bg-card text-card-foreground flex flex-col h-full shadow-sm z-10">
  <div class="p-4 flex justify-between items-center h-14 border-b">
    <h2 class="font-bold text-sm tracking-tight text-muted-foreground uppercase">{$_('projects')}</h2>
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={onRefresh} disabled={isScanning}>
      <RefreshCw class={cn("h-4 w-4", isScanning && "animate-spin")} />
    </Button>
  </div>

  <div class="flex-1 overflow-y-auto">
    <div class="p-2 space-y-1">
      {#each projects as project}
        <Button
          variant={selectedProjectId === project.id ? "secondary" : "ghost"}
          class={cn(
            "w-full justify-start gap-3 px-3 h-10 font-medium",
            selectedProjectId === project.id && "bg-accent text-accent-foreground"
          )}
          onclick={() => onSelectProject(project.id)}
        >
          <Folder class="h-4 w-4 text-muted-foreground" />
          <span class="truncate">{project.name}</span>
        </Button>
      {/each}
      {#if projects.length === 0 && !isScanning}
        <div class="px-3 py-8 text-center text-xs text-muted-foreground italic">
          {$_('noProjectsFound')}
        </div>
      {/if}
    </div>
  </div>

  <div class="p-4 border-t bg-muted/30">
    <Button variant="outline" class="w-full gap-2" onclick={onOpenSettings}>
      <SettingsIcon class="h-4 w-4" />
      {$_('settings')}
    </Button>
  </div>
</aside>
