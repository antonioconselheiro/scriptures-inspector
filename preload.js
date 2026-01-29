const { dialog, contextBridge } = require('electron');
const { readFile, writeFile } = require('fs/promises');

contextBridge.exposeInMainWorld('api', {
  readJsonFile: async path => {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  },

  //  FIXME: remover formatação do JSON
  writeJsonFile: async (path, data) => writeFile(path, JSON.stringify(data, null, 2)),

  openProject: async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select xenoglos project',
      properties: ['openFile'],
      filters: [
        {
          name: 'index',
          extensions: ['xenoglosproj']
        }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  }
});