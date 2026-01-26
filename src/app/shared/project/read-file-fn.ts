import { FileHandle, open as openFile } from '@tauri-apps/plugin-fs';

export async function readFileFn<T>(filePath: string): Promise<T | null> {
  let file: FileHandle | null = null;

  try {
    file = await openFile(filePath, { read: true });
    const fileStat = await file.stat();
    const buf = new Uint8Array(fileStat.size);
    await file.read(buf);
    const content = new TextDecoder().decode(buf);
    await file.close();
  
    return JSON.parse(content);
  } catch (e) {
    return null;
  } finally {
    if (file) {
      await file.close();
    }
  }
}
