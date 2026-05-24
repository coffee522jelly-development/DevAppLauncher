<script lang="ts">
  import { onMount } from 'svelte';
  import { _, isLoading } from 'svelte-i18n';
  import { open } from '@tauri-apps/plugin-dialog';
  import type { Project } from './lib/types';
  import { scanWorkspace } from './lib/utils/scanner';
  import Sidebar from './lib/components/Sidebar.svelte';
  import ProjectDetails from './lib/components/ProjectDetails.svelte';
  import Settings from './lib/components/Settings.svelte';
  import "./i18n";

  let workspaceRoots: string[] = JSON.parse(localStorage.getItem('workspaceRoots') || '[]');
  let projects: Project[] = [];
  let selectedProjectId: string | undefined;
  let showSettings = false;
  let isScanning = false;

  async function handleRefresh() {
    if (workspaceRoots.length === 0) {
      projects = [];
      return;
    }
    isScanning = true;
    try {
      const allDetectedProjects: Project[] = [];
      for (const root of workspaceRoots) {
        const detected = await scanWorkspace(root);
        allDetectedProjects.push(...detected);
      }

      projects = allDetectedProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
      );

      if (projects.length > 0 && !selectedProjectId) {
        selectedProjectId = projects[0].id;
      }
    } catch (error) {
      console.error("Failed to scan workspaces", error);
    } finally {
      isScanning = false;
    }
  }

  $: {
    localStorage.setItem('workspaceRoots', JSON.stringify(workspaceRoots));
    handleRefresh();
  }

  async function handleSelectWorkspace() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === "string") {
      if (!workspaceRoots.includes(selected)) {
        workspaceRoots = [...workspaceRoots, selected];
      }
    }
  }

  $: selectedProject = projects.find((p) => p.id === selectedProjectId);
</script>

{#if $isLoading}
  <div class="h-screen w-screen flex items-center justify-center bg-base-100">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else}
  <main class="h-screen w-screen flex bg-base-100 overflow-hidden text-base-content">
    {#if workspaceRoots.length === 0}
      <div class="flex-1 flex flex-col items-center justify-center space-y-6 text-center px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">Tauri Workspace Launcher</h1>
        <button class="btn btn-primary btn-lg" on:click={handleSelectWorkspace}>
          {$_('selectWorkspace')}
        </button>
      </div>
    {:else}
      <Sidebar
        {projects}
        {selectedProjectId}
        {isScanning}
        onSelectProject={(id) => selectedProjectId = id}
        onRefresh={handleRefresh}
        onOpenSettings={() => showSettings = true}
      />
      <div class="flex-1 overflow-hidden">
        {#if selectedProject}
          <ProjectDetails project={selectedProject} />
        {:else}
          <div class="h-full flex items-center justify-center text-base-content/50 italic">
            {#if projects.length > 0}
              {$_('selectAProject')}
            {:else if isScanning}
              <span class="loading loading-dots loading-lg"></span>
            {:else}
              {$_('noProjectsFound')}
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    {#if showSettings}
      <Settings
        {workspaceRoots}
        onWorkspaceRootsChange={(roots) => workspaceRoots = roots}
        onClose={() => showSettings = false}
      />
    {/if}
  </main>
{/if}
