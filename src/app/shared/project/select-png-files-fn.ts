export function selectPngFilesFn(): Promise<string[]> {
  return window.api.selectPngFiles();
}
