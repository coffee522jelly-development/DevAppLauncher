<script lang="ts">
  import { _, locale } from 'svelte-i18n';
  import { open } from '@tauri-apps/plugin-dialog';
  import {
    X,
    Plus,
    Trash2,
    Globe,
    Palette,
    Server,
    User,
    Key,
    LayoutGrid,
    Check,
    GitBranch,
    RefreshCw
  } from 'lucide-svelte';
  import { readDir, remove } from '@tauri-apps/plugin-fs';
  import { join } from '@tauri-apps/api/path';
  import { Button } from './ui/button';
  import { Input } from './ui/input';
  import { Label } from './ui/label';
  import { Separator } from './ui/separator';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
  import { cn } from '$lib/utils';

  let {
    workspaceRoots = [],
    gitServerUrl = '',
    gitUsername = '',
    gitToken = '',
    currentTheme = 'night',
    onWorkspaceRootsChange,
    onGitServerUrlChange,
    onGitUsernameChange,
    onGitTokenChange,
    onThemeChange,
    onClose
  }: {
    workspaceRoots?: string[],
    gitServerUrl?: string,
    gitUsername?: string,
    gitToken?: string,
    currentTheme?: string,
    onWorkspaceRootsChange: (roots: string[]) => void,
    onGitServerUrlChange: (url: string) => void,
    onGitUsernameChange: (user: string) => void,
    onGitTokenChange: (token: string) => void,
    onThemeChange: (theme: string) => void,
    onClose: () => void
  } = $props();

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

  async function handleResetWorkspace(rootPath: string) {
    try {
      const entries = await readDir(rootPath);
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name.endsWith('.zip')) {
          continue;
        }
        const fullPath = await join(rootPath, entry.name);
        await remove(fullPath, { recursive: true });
      }
      alert(`Reset workspace ${rootPath} complete.`);
    } catch (error) {
      console.error(`Failed to reset workspace ${rootPath}`, error);
      alert(`Failed to reset workspace ${rootPath}: ${error}`);
    }
  }

  function handleLanguageChange(lang: string) {
    locale.set(lang);
    localStorage.setItem('language', lang);
  }

  const themes = [
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro",
    "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel",
    "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business",
    "acid", "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset"
  ];
</script>

<Dialog open={true} onOpenChange={(open: boolean) => !open && onClose()}>
  <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
    <DialogHeader class="p-6 border-b shrink-0">
      <DialogTitle class="text-2xl font-bold tracking-tight">{$_('settings')}</DialogTitle>
      <p class="text-sm text-muted-foreground italic">Customize your DevAppLauncher experience.</p>
    </DialogHeader>

    <div class="flex-1 overflow-y-auto">
        <div class="p-6 m-0 space-y-8">
          <!-- Workspaces Section -->
          <section class="space-y-4">
            <div class="flex items-center gap-2 text-primary font-bold">
              <LayoutGrid class="h-4 w-4" />
              <h3 class="text-sm uppercase tracking-wider">{$_('workspaceRoot')}</h3>
            </div>

            <div class="space-y-2">
              {#each workspaceRoots as root}
                <div class="flex items-center justify-between bg-muted/50 p-2 pl-4 rounded-lg border group transition-all hover:border-primary/50">
                  <span class="text-xs font-mono truncate mr-4">{root}</span>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="icon" class="h-7 w-7 text-warning opacity-0 group-hover:opacity-100 transition-opacity" onclick={() => handleResetWorkspace(root)} title="Reset (Delete all except .zip and node_modules)">
                      <RefreshCw class="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" class="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onclick={() => handleRemoveWorkspace(root)} title="Remove workspace">
                      <Trash2 class="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              {/each}
              {#if workspaceRoots.length === 0}
                <div class="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm italic">
                  No workspaces added yet.
                </div>
              {/if}
              <Button variant="outline" class="w-full border-dashed h-10 gap-2 mt-2" onclick={handleAddWorkspace}>
                <Plus class="h-4 w-4" />
                {$_('selectWorkspace')}
              </Button>
            </div>
          </section>

          <Separator />

          <!-- Git Section -->
          <section class="space-y-4">
            <div class="flex items-center gap-2 text-primary font-bold">
              <GitBranch class="h-4 w-4" />
              <h3 class="text-sm uppercase tracking-wider">Git Configuration</h3>
            </div>

            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="git-url" class="flex items-center gap-2 opacity-70">
                  <Server class="h-3 w-3" /> {$_('gitServerUrl')}
                </Label>
                <Input id="git-url" placeholder="https://github.com/my-org" value={gitServerUrl} oninput={(e: any) => onGitServerUrlChange(e.currentTarget.value)} />
                <p class="text-[10px] text-muted-foreground italic px-1">{$_('gitServerExample')}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="grid gap-2">
                  <Label for="git-user" class="flex items-center gap-2 opacity-70">
                    <User class="h-3 w-3" /> {$_('gitUsername')}
                  </Label>
                  <Input id="git-user" placeholder="Username" value={gitUsername} oninput={(e: any) => onGitUsernameChange(e.currentTarget.value)} />
                </div>
                <div class="grid gap-2">
                  <Label for="git-token" class="flex items-center gap-2 opacity-70">
                    <Key class="h-3 w-3" /> {$_('gitToken')}
                  </Label>
                  <Input id="git-token" type="password" placeholder="PAT" value={gitToken} oninput={(e: any) => onGitTokenChange(e.currentTarget.value)} />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <!-- Appearance Section -->
          <section class="grid grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="flex items-center gap-2 text-primary font-bold">
                <Globe class="h-4 w-4" />
                <h3 class="text-sm uppercase tracking-wider">{$_('language')}</h3>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <Button variant={$locale === 'en' ? 'default' : 'outline'} size="sm" onclick={() => handleLanguageChange('en')}>English</Button>
                <Button variant={$locale === 'ja' ? 'default' : 'outline'} size="sm" onclick={() => handleLanguageChange('ja')}>日本語</Button>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-2 text-primary font-bold">
                <Palette class="h-4 w-4" />
                <h3 class="text-sm uppercase tracking-wider">{$_('theme')}</h3>
              </div>
              <select
                class="w-full bg-background border rounded-md h-9 px-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                value={currentTheme}
                onchange={(e: any) => onThemeChange(e.currentTarget.value)}
              >
                {#each themes as theme}
                  <option value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
                {/each}
              </select>
            </div>
          </section>
        </div>
      </div>

    <div class="p-6 border-t bg-muted/20 flex justify-end shrink-0">
      <Button variant="default" class="px-8" onclick={onClose}>
        <Check class="h-4 w-4 mr-2" />
        Done
      </Button>
    </div>
  </DialogContent>
</Dialog>
