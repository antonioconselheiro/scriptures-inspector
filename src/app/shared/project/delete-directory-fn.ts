export function deleteDirectoryFn(folder: string): Promise<boolean> {
  console.info(`[Deleting directory]`, `"${folder}"`);
  return window.api.deleteDirectory(folder);
}