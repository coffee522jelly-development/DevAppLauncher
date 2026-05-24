import { open } from '@tauri-apps/plugin-dialog';

async function handleAddWorkspace() {
  const selected = await open({
    directory: true,
    multiple: false,
  });
  console.log(selected);
}
