const { app, protocol, net, Menu, BrowserWindow, ipcMain, dialog } = require('electron/main');
const path = require('path');
const fs = require('fs/promises');
const { fileURLToPath, pathToFileURL } = require('url');

let mainWindow;
let pendingProjectPath = getProjectPath(process.argv);
let projectFileListenerReady = false;

function getProjectPath(args) {
  const projectArgument = args.find(argument => /\.xenoglosproj$/i.test(argument));
  if (!projectArgument) {
    return null;
  }

  const filePath = projectArgument.startsWith('file://')
    ? fileURLToPath(projectArgument)
    : path.resolve(projectArgument);

  return path.extname(filePath).toLowerCase() === '.xenoglosproj' ? filePath : null;
}

function openProjectPath(filePath) {
  if (projectFileListenerReady && mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('open-project-file', filePath);
  } else {
    pendingProjectPath = filePath;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
  }
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_, commandLine) => {
    const filePath = getProjectPath(commandLine);
    if (filePath) {
      openProjectPath(filePath);
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    if (path.extname(filePath).toLowerCase() === '.xenoglosproj') {
      openProjectPath(filePath);
    }
  });
}

ipcMain.on('project-file-listener-ready', (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    return;
  }

  projectFileListenerReady = true;
  if (pendingProjectPath) {
    const filePath = pendingProjectPath;
    pendingProjectPath = null;
    event.sender.send('open-project-file', filePath);
  }
});

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

ipcMain.handle('select-png-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Imagens PNG',
        extensions: ['png']
      }
    ]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths;
});

ipcMain.handle('import-images', async (_, filePaths, destiny) => {
  await fs.mkdir(destiny, { recursive: true });

  for (const file of filePaths) {
    const name = path.basename(file);
    await fs.copyFile(file, path.join(destiny, name));
  }

  return true;
});

ipcMain.handle('list-directories', async (_, folderPath) => {
  try {
    const entries = await fs.readdir(folderPath, {
      withFileTypes: true,
    });

    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    // Pasta não existe, não é acessível ou ocorreu outro erro.
    return [];
  }
});

ipcMain.handle("delete-directory", async (_, folderPath) => {
  try {
    await fs.rm(folderPath, {
      recursive: true,
      force: true,
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
});

ipcMain.handle('read-image-base64', async (_, filePath) => {
  filePath = decodeURIComponent(
    filePath.replace("local://", "")
  );

  const buffer = await fs.readFile(filePath);
  const ext = filePath.toLowerCase().split('.').pop();

  const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml'
  };

  const mime = mimeTypes[ext ?? ''] ?? 'application/octet-stream';
  const dataStr = `data:${mime};base64,${buffer.toString('base64')}`;

  console.info('[ipcMain] base64:', dataStr);

  return dataStr;
});


const isDev = !app.isPackaged;

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, 'public', 'script.png')
    : path.join(app.getAppPath(), 'public', 'script.png');

  mainWindow = new BrowserWindow({
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
  if (!hasSingleInstanceLock) {
    return;
  }

  protocol.handle("local", (request) => {
    const filePath = decodeURIComponent(
      request.url.replace("local://", "")
    );

    return net.fetch(pathToFileURL(filePath).toString());
  });

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
