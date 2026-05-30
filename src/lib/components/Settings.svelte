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
    GitBranch
  } from 'lucide-svelte';
  import { Button } from './ui/button';
  import { Input } from './ui/input';
  import { Label } from './ui/label';
  import { Separator } from './ui/separator';
  import { ScrollArea } from './ui/scroll-area';
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

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
  <div class="fixed inset-0 bg-black/60" onclick={onClose}></div>

  <div class="relative w-full max-w-2xl max-h-[90vh] bg-card text-card-foreground border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b shrink-0">
      <div class="space-y-1">
        <h2 class="text-2xl font-bold tracking-tight">{$_('settings')}</h2>
        <p class="text-sm text-muted-foreground italic">Customize your DevAppLauncher experience.</p>
      </div>
      <Button variant="ghost" size="icon" class="rounded-full" onclick={onClose}>
        <X class="h-5 w-5" />
      </Button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-8">
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
              <Button variant="ghost" size="icon" class="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onclick={() => handleRemoveWorkspace(root)}>
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
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
            <Input id="git-url" placeholder="https://github.com/my-org" value={gitServerUrl} oninput={(e) => onGitServerUrlChange(e.currentTarget.value)} />
            <p class="text-[10px] text-muted-foreground italic px-1">{$_('gitServerExample')}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="git-user" class="flex items-center gap-2 opacity-70">
                <User class="h-3 w-3" /> {$_('gitUsername')}
              </Label>
              <Input id="git-user" placeholder="Username" value={gitUsername} oninput={(e) => onGitUsernameChange(e.currentTarget.value)} />
            </div>
            <div class="grid gap-2">
              <Label for="git-token" class="flex items-center gap-2 opacity-70">
                <Key class="h-3 w-3" /> {$_('gitToken')}
              </Label>
              <Input id="git-token" type="password" placeholder="PAT" value={gitToken} oninput={(e) => onGitTokenChange(e.currentTarget.value)} />
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
          <div class="relative group">
            <select
              class="w-full bg-background border rounded-md h-9 px-3 text-sm font-medium appearance-none focus:ring-1 focus:ring-primary outline-none cursor-pointer"
              value={currentTheme}
              onchange={(e) => onThemeChange(e.currentTarget.value)}
            >
              {#each themes as theme}
                <option value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
              {/each}
            </select>
            <div class="absolute right-3 top-2.5 pointer-events-none opacity-50">
              <LayoutGrid class="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <div class="p-6 border-t bg-muted/20 flex justify-end shrink-0">
      <Button variant="default" class="px-8" onclick={onClose}>
        <Check class="h-4 w-4 mr-2" />
        Done
      </Button>
    </div>
  </div>
</div>
