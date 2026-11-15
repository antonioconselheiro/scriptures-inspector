export function localImageUrlFn(filePath: string): string {
  return `local:///${encodeURIComponent(filePath)}`;
}
