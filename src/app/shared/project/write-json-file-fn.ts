import { FileHandle, open as openFile } from '@tauri-apps/plugin-fs';

export async function writeJsonFileFn(pathName: string, content: object) {
  let file: FileHandle | null = null;

  try {
    file = await openFile(pathName, { write: true });
    await file.write(new TextEncoder().encode(JSON.stringify(content, null, 2)));
  } finally {
    if (file) {
      await file.close();
    }
  }
}
