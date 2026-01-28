export async function writeJsonFileFn(pathName: string, content: object) {
  return window.api.writeJsonFile(pathName, content);
}
