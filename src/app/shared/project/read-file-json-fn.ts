export async function readJsonFileFn<T>(filePath: string): Promise<T | null> {
  console.info(`[Reading file]`, `"${filePath}"`);
  return window.api.readJsonFile(filePath);
}
