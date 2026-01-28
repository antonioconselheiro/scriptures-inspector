export async function readJsonFileFn<T>(filePath: string): Promise<T | null> {
  return window.api.readJsonFile(filePath);
}
