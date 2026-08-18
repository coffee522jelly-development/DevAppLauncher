<script lang="ts">
  import { onMount } from 'svelte';
  import { _, isLoading } from 'svelte-i18n';
  import { open } from '@tauri-apps/plugin-dialog';
  import type { Project } from '../lib/types';
  import { scanWorkspace } from '../lib/utils/scanner';
  import Sidebar from '../lib/components/Sidebar.svelte';
  import ProjectDetails from '../lib/components/ProjectDetails.svelte';
  import Settings from '../lib/components/Settings.svelte';
  import "../i18n";

  let workspaceRoots: string[] = $state(JSON.parse(localStorage.getItem('workspaceRoots') || '[]'));
  let gitServerUrl: string = $state(localStorage.getItem('gitServerUrl') || '');
  let gitUsername: string = $state(localStorage.getItem('gitUsername') || '');
  let gitToken: string = $state(localStorage.getItem('gitToken') || '');
  let currentTheme: string = $state(localStorage.getItem('theme') || 'night');
  let errorColor: string = $state(localStorage.getItem('errorColor') || '#fb7185');
  let infoColor: string = $state(localStorage.getItem('infoColor') || '#38bdf8');
  let projects: Project[] = $state([]);
  let selectedProjectId: string | undefined = $state(localStorage.getItem('selectedProjectId') || undefined);
  let showSettings = $state(false);
  let isScanning = $state(false);

  async function handleRefresh() {
    if (workspaceRoots.length === 0) {
      projects = [];
      return;
    }

    isScanning = true;

    try {
      // 1. Initialize projects with loading state for each root
      const initialProjects: Project[] = workspaceRoots.map(root => ({
        id: root,
        name: root.split(/[/\\]/).filter(Boolean).pop() || 'unnamed',
        path: root,
        packageManager: 'npm',
        scripts: {},
        isTauri: false,
        isLoading: true
      }));

      // Preserve existing projects if they are not in the new roots
      projects = initialProjects;

      const allDetectedProjects: Project[] = [];

      // 2. Perform actual scan for each root
      for (const root of workspaceRoots) {
        try {
          const detected = await scanWorkspace(root);
          allDetectedProjects.push(...detected);
        } catch (scanError) {
          console.error(`Failed to scan root ${root}:`, scanError);
        }
      }

      // 3. Update state with actual data
      const uniqueProjects = allDetectedProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
      );

      projects = uniqueProjects;

      if (projects.length > 0 && (!selectedProjectId || !projects.find(p => p.id === selectedProjectId))) {
        selectedProjectId = projects[0].id;
      }
    } catch (error) {
      console.error("Critical failure during refresh:", error);
    } finally {
      isScanning = false;
    }
  }

  // Persistence effect - decoupled from heavy scanning logic
  $effect(() => {
    localStorage.setItem('workspaceRoots', JSON.stringify(workspaceRoots));
    localStorage.setItem('gitServerUrl', gitServerUrl);
    localStorage.setItem('gitUsername', gitUsername);
    localStorage.setItem('gitToken', gitToken);
    localStorage.setItem('theme', currentTheme);
    localStorage.setItem('errorColor', errorColor);
    localStorage.setItem('infoColor', infoColor);
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    }
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: currentTheme } }));
  });

  onMount(() => {
    console.log('App mounted. Triggering initial scan in 200ms.');
    // Small delay to ensure Tauri APIs are ready
    const timer = setTimeout(() => {
      handleRefresh();
    }, 200);
    return () => clearTimeout(timer);
  });

  // Scan effect - only runs when workspaceRoots change length (add/remove)
  $effect(() => {
    // We stringify the roots to establish a deep dependency on the array contents
    const rootsString = JSON.stringify(workspaceRoots);
    console.log(`Workspace roots updated: ${rootsString}. Re-scanning.`);
    handleRefresh();
  });

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

  const selectedProject = $derived(projects.find((p) => p.id === selectedProjectId));
</script>

{#if $isLoading}
  <div class="h-screen w-screen flex items-center justify-center bg-base-100">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  <main class="h-screen w-screen flex bg-base-100 overflow-hidden text-base-content">
    {#if workspaceRoots.length === 0}
      <div class="flex-1 flex flex-col items-center justify-center space-y-6 text-center px-4">
        <h1 class="text-5xl font-black tracking-tighter bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">DevAppLauncher</h1>
        <p class="text-base-content/60 max-w-sm">Manage your projects and workspaces from a single desktop GUI.</p>
        <button type="button" class="btn btn-primary btn-lg shadow-xl" onclick={handleSelectWorkspace}>
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
          <ProjectDetails
            project={selectedProject}
            {gitServerUrl}
            {gitUsername}
            {gitToken}
            {errorColor}
            {infoColor}
            onRefresh={handleRefresh}
          />
        {:else}
          <div class="h-full flex items-center justify-center text-base-content/30 italic">
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
        {gitServerUrl}
        {gitUsername}
        {gitToken}
        {currentTheme}
        {errorColor}
        {infoColor}
        onWorkspaceRootsChange={(roots) => workspaceRoots = roots}
        onGitServerUrlChange={(url) => gitServerUrl = url}
        onGitUsernameChange={(user) => gitUsername = user}
        onGitTokenChange={(token) => gitToken = token}
        onThemeChange={(theme) => currentTheme = theme}
        onErrorColorChange={(color) => errorColor = color}
        onInfoColorChange={(color) => infoColor = color}
        onClose={() => showSettings = false}
      />
    {/if}
  </main>
{/if}
