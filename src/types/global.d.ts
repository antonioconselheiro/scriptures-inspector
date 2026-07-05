declare global {
  interface Window {
    api: {
      readJsonFile<T>(path: string): Promise<T | null>;
      writeJsonFile(path: string, data: object): Promise<void>;
      openProject(): Promise<string>;
      selectPngFiles(): Promise<Array<string>>;
      listDirectories(folderPath: string): Promise<Array<string>>;
    };
  }
}

export {};