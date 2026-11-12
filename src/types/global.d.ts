declare global {
  interface Window {
    api: {
      initializeProjectOpening(): Promise<string | null>;
      onProjectFileOpened(callback: (filePath: string) => void): void;
      updateCodexConfigMenu(codices: Array<{ source: string; label: string }>): Promise<void>;
      maximizeWindow(): void;
      onOpenCodexConfig(callback: (source: string) => void): () => void;
      onOpenProjectMenuAction(callback: (action: 'viewing-translation' | 'import-from-book' | 'save-project') => void): () => void;
      onToggleToolbox(callback: (
        toolbox: 'page-navigation' | 'codex-navigation' | 'text-size-controller',
        visible: boolean
      ) => void): () => void;
      getToolboxVisibility(): Promise<{
        pageNavigation: boolean;
        codexNavigation: boolean;
        textSizeController: boolean;
      }>;
      applicationStartupReady(maximizeWindow?: boolean): void;
      readImageBase64(filePath: string): Promise<string | null>;
      readJsonFile<T>(path: string): Promise<T | null>;
      writeJsonFile(path: string, data: object): Promise<void>;
      openProject(): Promise<string | null>;
      selectPngFiles(): Promise<Array<string>>;
      listDirectories(folderPath: string): Promise<Array<string>>;
      deleteDirectory(folder: string): Promise<boolean>;
      importImages(filePaths: Array<string>, destiny: string): Promise<void>;
    };
  }
}

export {};