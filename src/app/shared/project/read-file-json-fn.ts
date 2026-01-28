import { promises as fs } from 'fs';

export async function readJsonFileFn<T>(filePath: string): Promise<T | null> {
  fs.readFile(filePath).then(JSON.parse);
}
