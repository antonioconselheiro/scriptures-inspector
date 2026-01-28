import { contextBridge } from 'electron';
import { readFile, writeFile } from 'fs/promises';

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});

contextBridge.exposeInMainWorld('api', {
  readJsonFile: async path => {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  },

  //  FIXME: remover formatação do JSON
  writeJsonFile: async (path, data) => writeFile(path, JSON.stringify(data, null, 2))
});