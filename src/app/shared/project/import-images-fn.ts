export function importImagesFn(filePaths: Array<string>, destiny: string): Promise<void> {
  return window.api.importImages(filePaths, destiny);
}
