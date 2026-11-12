export function selectPngFilesFn(): Promise<string[] | null> {
  return window.api.selectPngFiles();
}
