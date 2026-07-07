declare global {
  interface Window {
    api: {
      readJsonFile<T>(path: string): Promise<T | null>;
      writeJsonFile(path: string, data: object): Promise<void>;
      openProject(): Promise<string>;
      selectPngFiles(): Promise<Array<string>>;
      listDirectories(folderPath: string): Promise<Array<string>>;
      deleteDirectory(folder: string): Promise<boolean>;
      importImages(filePaths: Array<string>, destiny: string): Promise<void>;
    };
  }
}

export {};