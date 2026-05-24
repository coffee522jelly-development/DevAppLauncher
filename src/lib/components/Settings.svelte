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
  <div class="modal-box max-w-xl">
    <div class="flex justify-between items-center mb-6">
      <h3 class="font-bold text-lg">{$_('settings')}</h3>
      <button class="btn btn-sm btn-circle btn-ghost" on:click={onClose}>✕</button>
    </div>

    <div class="space-y-6">
      <div class="form-control">
        <label class="label">
          <span class="label-text font-bold">{$_('workspaceRoot')}</span>
        </label>
        <div class="space-y-2">
          {#each workspaceRoots as root}
            <div class="flex items-center justify-between bg-base-200 p-2 rounded-lg text-sm group">
              <span class="truncate pr-2" title={root}>{root}</span>
              <button class="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100" on:click={() => handleRemoveWorkspace(root)}>
                ✕
              </button>
            </div>
          {/each}
          <button class="btn btn-primary btn-block btn-sm mt-2" on:click={handleAddWorkspace}>
            + {$_('selectWorkspace')}
          </button>
        </div>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-bold">{$_('language')}</span>
        </label>
        <select
          class="select select-bordered select-sm w-full"
          value={$locale}
          on:change={(e) => handleLanguageChange(e.currentTarget.value)}
        >
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </div>

    <div class="modal-action">
      <button class="btn" on:click={onClose}>Close</button>
    </div>
  </div>
  <div class="modal-backdrop bg-black/50" on:click={onClose}></div>
</div>
