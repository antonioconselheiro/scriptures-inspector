export function importImages(filePaths: Array<string>, destiny: string): Promise<void> {
  return window.api.importImages(filePaths, destiny);
}