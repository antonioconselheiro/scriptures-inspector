export async function writeJsonFileFn(pathName: string, content: object): Promise<void> {
  console.info(`[Writing file]`, `"${pathName}"`);
  return window.api.writeJsonFile(pathName, content);
}
