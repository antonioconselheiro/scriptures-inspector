export function readImageBase64(localUrl: string): Promise<string | null> {
  console.info(`[Reading Image Base64]`, `"${localUrl}"`);
  return window.api.readImageBase64(localUrl).catch(e => {
    console.error(e);
    return Promise.reject(e);
  });
}
