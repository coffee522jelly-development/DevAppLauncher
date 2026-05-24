<script lang="ts">
  import { _, locale } from 'svelte-i18n';
  import { open } from '@tauri-apps/plugin-dialog';

  export let workspaceRoots: string[] = [];
  export let onWorkspaceRootsChange: (roots: string[]) => void;
  export let onClose: () => void;

  async function handleAddWorkspace() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === 'string') {
      if (!workspaceRoots.includes(selected)) {
        onWorkspaceRootsChange([...workspaceRoots, selected]);
      }
    }
  }

  function handleRemoveWorkspace(path: string) {
    onWorkspaceRootsChange(workspaceRoots.filter((root) => root !== path));
  }

  function handleLanguageChange(lang: string) {
    locale.set(lang);
    localStorage.setItem('language', lang);
  }
</script>

<div class="modal modal-open">
  <div class="modal-box max-w-xl border border-base-300 shadow-2xl bg-base-100">
    <div class="flex justify-between items-center mb-6">
      <h3 class="font-black text-2xl text-primary">{$_('settings')}</h3>
      <button class="btn btn-sm btn-circle btn-ghost" on:click={onClose}>✕</button>
    </div>

    <div class="space-y-6">
      <div class="form-control">
        <label class="label">
          <span class="label-text font-black uppercase text-xs opacity-60">{$_('workspaceRoot')}</span>
        </label>
        <div class="space-y-2 max-h-48 overflow-y-auto p-1">
          {#if workspaceRoots.length === 0}
            <div class="text-center py-4 border-2 border-dashed border-base-300 rounded-lg text-sm opacity-50 italic">
              No workspaces added
            </div>
          {/if}
          {#each workspaceRoots as root}
            <div class="flex items-center justify-between bg-base-200 p-3 rounded-xl text-xs group hover:bg-base-300 transition-colors border border-base-300">
              <span class="truncate pr-4 font-mono" title={root}>{root}</span>
              <button class="btn btn-circle btn-ghost btn-xs text-error" on:click={() => handleRemoveWorkspace(root)}>
                ✕
              </button>
            </div>
          {/each}
        </div>
        <button class="btn btn-primary btn-block btn-sm mt-4 shadow-lg" on:click={handleAddWorkspace}>
          <span class="text-lg">+</span> {$_('selectWorkspace')}
        </button>
      </div>

      <div class="divider"></div>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-black uppercase text-xs opacity-60">{$_('language')}</span>
        </label>
        <select
          class="select select-bordered select-sm w-full font-bold focus:select-primary"
          value={$locale}
          on:change={(e) => handleLanguageChange(e.currentTarget.value)}
        >
          <option value="en">English (US)</option>
          <option value="ja">日本語 (JP)</option>
        </select>
      </div>
    </div>

    <div class="modal-action">
      <button class="btn btn-neutral" on:click={onClose}>Close</button>
    </div>
  </div>
  <div class="modal-backdrop bg-black/70 backdrop-blur-sm" on:click={onClose}></div>
</div>
