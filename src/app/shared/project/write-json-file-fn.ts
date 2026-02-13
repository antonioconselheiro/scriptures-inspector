export async function writeJsonFileFn(pathName: string, content: object): Promise<void> {
  return window.api.writeJsonFile(pathName, content);
}
