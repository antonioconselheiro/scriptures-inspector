const { app, Menu, BrowserWindow, ipcMain, dialog } = require('electron/main');
const path = require('path');
const fs = require('fs/promises');

ipcMain.handle('read-json-file', async (_, fileName) => {
  const data = await fs.readFile(fileName, 'utf-8');
  return JSON.parse(data);
});

ipcMain.handle('write-json-file', async (_, fileName, data) => {
  //  FIXME: remover formatação do JSON
  const dir = path.dirname(fileName);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fileName, JSON.stringify(data, null, 2));
});

ipcMain.handle('open-project', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'index', extensions: ['xenoglosproj'] }]
  });

  return result.canceled ? null : result.filePaths[0];
});

const isDev = !app.isPackaged;
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4205');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(
      path.join(__dirname, 'dist/index.html')
    );
  }

  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
