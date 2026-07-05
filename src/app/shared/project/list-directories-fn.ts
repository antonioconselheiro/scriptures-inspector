export function listDirectoriesFn(folderPath: string): Promise<Array<string>> {
  console.info(`[Listing directories]`, `"${folderPath}"`);
  return window.api.listDirectories(folderPath);
}