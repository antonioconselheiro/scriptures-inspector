const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readJsonFile: (path) => ipcRenderer.invoke('read-json-file', path),
  writeJsonFile: (path, data) => ipcRenderer.invoke('write-json-file', path, data),
  listDirectories: (folderPath) => ipcRenderer.invoke('list-directories', folderPath),
  openProject: () => ipcRenderer.invoke('open-project'),
  selectPngFiles: () => ipcRenderer.invoke('select-png-files'),
  deleteDirectory: (folder) => ipcRenderer.invoke('delete-directory', folder),
  importImages: (filePaths, destiny) => ipcRenderer.invoke('import-images', filePaths, destiny),
});
