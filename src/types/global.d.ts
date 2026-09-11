declare global {
  interface Window {
    api: {
      readImageBase64(filePath: string): Promise<string | null>;
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