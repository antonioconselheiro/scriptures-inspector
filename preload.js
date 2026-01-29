const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readJsonFile: (path) => ipcRenderer.invoke('read-json-file', path),
  writeJsonFile: (path, data) => ipcRenderer.invoke('write-json-file', path, data),
  openProject: () => ipcRenderer.invoke('open-project')
});
