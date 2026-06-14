const { app, Menu, BrowserWindow, ipcMain, dialog } = require('electron/main');
const path = require('path');
const fs = require('fs/promises');

ipcMain.handle('read-json-file', async (_, fileName) => {
  try {
    const data = await fs.readFile(fileName, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    throw error;
  }
});

ipcMain.handle('write-json-file', async (_, fileName, data) => {
  try {
    //  FIXME: remover formatação do JSON
    const dir = path.dirname(fileName);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fileName, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing JSON file:', error);
    throw error;
  }
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
  const iconPath = isDev
    ? path.join(__dirname, 'public', 'script.png')
    : path.join(app.getAppPath(), 'public', 'script.png');

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true,
      nodeIntegrationInWorker: false,
      enableWebSQL: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4205');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const appPath = app.getAppPath();
    const indexPath = path.join(appPath, 'dist/index.html');
    console.log('Loading:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  Menu.setApplicationMenu(menu);
  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details);
  });
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
