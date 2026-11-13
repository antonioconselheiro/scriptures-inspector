const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  initializeProjectOpening: () => ipcRenderer.invoke('initialize-project-opening'),
  onProjectFileOpened: (callback) => ipcRenderer.on('open-project-file', (_, filePath) => callback(filePath)),
  updateCodexConfigMenu: (codices) => ipcRenderer.invoke('update-codex-config-menu', codices),
  setPreviewActive: (active) => ipcRenderer.invoke('set-preview-active', active),
  onOpenCodexConfig: (callback) => {
    const listener = (_, source) => callback(source);
    ipcRenderer.on('open-codex-config', listener);
    return () => ipcRenderer.removeListener('open-codex-config', listener);
  },
  onOpenProjectMenuAction: (callback) => {
    const listener = (_, action) => callback(action);
    ipcRenderer.on('open-project-menu-action', listener);
    return () => ipcRenderer.removeListener('open-project-menu-action', listener);
  },
  onToggleToolbox: (callback) => {
    const listener = (_, toolbox, visible) => callback(toolbox, visible);
    ipcRenderer.on('toggle-toolbox', listener);
    return () => ipcRenderer.removeListener('toggle-toolbox', listener);
  },
  getToolboxVisibility: () => ipcRenderer.invoke('get-toolbox-visibility'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  applicationStartupReady: (maximizeWindow) => ipcRenderer.send('application-startup-ready', maximizeWindow),
  readImageBase64: (filePath) => ipcRenderer.invoke('read-image-base64', filePath),
  readJsonFile: (path) => ipcRenderer.invoke('read-json-file', path),
  readOptionalJsonFile: (path) => ipcRenderer.invoke('read-optional-json-file', path),
  writeJsonFile: (path, data) => ipcRenderer.invoke('write-json-file', path, data),
  listDirectories: (folderPath) => ipcRenderer.invoke('list-directories', folderPath),
  openProject: () => ipcRenderer.invoke('open-project'),
  selectPngFiles: () => ipcRenderer.invoke('select-png-files'),
  deleteDirectory: (folder) => ipcRenderer.invoke('delete-directory', folder),
  importImages: (filePaths, destiny) => ipcRenderer.invoke('import-images', filePaths, destiny)
});
