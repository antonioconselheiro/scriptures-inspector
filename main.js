const { app, protocol, net, Menu, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron/main');
const path = require('path');
const fs = require('fs/promises');
const { fileURLToPath, pathToFileURL } = require('url');

let mainWindow;
let splashWindow;
let applicationMenu;
const toolboxVisibility = {
  pageNavigation: true,
  codexNavigation: false,
  verseNavigation: true,
  textSizeController: false
};
let pendingProjectPath = getProjectPath(process.argv);
let projectFileListenerReady = false;
let mainWindowReady = false;
let applicationStartupComplete = false;
let maximizeMainWindowOnStartup = false;

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
  pendingProjectPath = filePath;
  applicationStartupComplete = false;
  showSplash();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }

  if (projectFileListenerReady && mainWindow && !mainWindow.isDestroyed()) {
    pendingProjectPath = null;
    mainWindow.webContents.send('open-project-file', filePath);
  }
}

function showMainWindow() {
  if (!applicationStartupComplete || !mainWindowReady || !mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
    splashWindow = null;
  }

  mainWindow.show();
  if (maximizeMainWindowOnStartup) {
    mainWindow.maximize();
    maximizeMainWindowOnStartup = false;
  }
  mainWindow.focus();
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

ipcMain.handle('initialize-project-opening', (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    throw new Error('Project opening can only be initialized by the main window');
  }

  projectFileListenerReady = true;
  const filePath = pendingProjectPath;
  pendingProjectPath = null;
  if (filePath) {
    applicationStartupComplete = false;
  }
  return filePath;
});

ipcMain.handle('update-codex-config-menu', (event, codices) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    throw new Error('Codex config menus can only be updated by the main window');
  }
  if (!Array.isArray(codices) || codices.some(codex =>
    !codex || typeof codex.source !== 'string' || typeof codex.label !== 'string'
  )) {
    throw new TypeError('Codex config menu items must have a source and label');
  }

  updateApplicationMenu(codices);
});

ipcMain.handle('get-toolbox-visibility', event => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    throw new Error('Toolbox visibility can only be read by the main window');
  }
  return { ...toolboxVisibility };
});

function sendProjectMenuAction(action) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('open-project-menu-action', action);
  }
}

function sendToolboxVisibility(toolbox, visible) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('toggle-toolbox', toolbox, visible);
  }
}

ipcMain.on('application-startup-complete', (event, maximizeWindow) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    return;
  }

  maximizeMainWindowOnStartup = maximizeWindow === true;
  applicationStartupComplete = true;
  showMainWindow();
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

function showSplash() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    return;
  }

  const iconPath = isDev
    ? path.join(__dirname, 'public', 'script.png')
    : path.join(app.getAppPath(), 'public', 'script.png');
  const splashPath = isDev
    ? path.join(__dirname, 'public', 'splash.html')
    : path.join(app.getAppPath(), 'public', 'splash.html');

  splashWindow = new BrowserWindow({
    width: 560,
    height: 190,
    show: true,
    frame: false,
    resizable: false,
    center: true,
    skipTaskbar: true,
    backgroundColor: '#f7f5f0',
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  splashWindow.setMenu(null);
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
  splashWindow.loadFile(splashPath, {
    query: { loading: 'true' }
  }).catch(error => {
    console.error('Unable to load startup splash:', error);
  });
}

function updateApplicationMenu(codices = []) {
  const iconPath = isDev
    ? path.join(__dirname, 'public', 'script.png')
    : path.join(app.getAppPath(), 'public', 'script.png');
  const applicationIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  const codexConfigMenuItems = codices.map(codex => ({
    label: codex.label,
    click: () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('open-codex-config', codex.source);
      }
    }
  }));
  applicationMenu = Menu.buildFromTemplate([
  {
    label: 'File',
    icon: applicationIcon,
    submenu: [
      {
        label: 'Save Project',
        click: () => sendProjectMenuAction('save-project')
      },
      { type: 'separator' },
      { role: 'close' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Import from Book',
        click: () => sendProjectMenuAction('import-from-book')
      },
      { type: 'separator' },
      {
        label: 'Viewing Translation',
        click: () => sendProjectMenuAction('viewing-translation')
      },
      {
        label: 'Codex Configs',
        submenu: codexConfigMenuItems
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      {
        type: 'checkbox',
        label: 'Codex Navigation',
        checked: toolboxVisibility.codexNavigation,
        click: menuItem => {
          toolboxVisibility.codexNavigation = menuItem.checked;
          sendToolboxVisibility('codex-navigation', menuItem.checked);
        }
      },
      {
        type: 'checkbox',
        label: 'Page Navigation',
        checked: toolboxVisibility.pageNavigation,
        click: menuItem => {
          toolboxVisibility.pageNavigation = menuItem.checked;
          sendToolboxVisibility('page-navigation', menuItem.checked);
        }
      },
      {
        type: 'checkbox',
        label: 'Verse Navigation',
        checked: toolboxVisibility.verseNavigation,
        click: menuItem => {
          toolboxVisibility.verseNavigation = menuItem.checked;
          sendToolboxVisibility('verse-navigation', menuItem.checked);
        }
      },
      {
        type: 'checkbox',
        label: 'Text Size Controller',
        checked: toolboxVisibility.textSizeController,
        click: menuItem => {
          toolboxVisibility.textSizeController = menuItem.checked;
          sendToolboxVisibility('text-size-controller', menuItem.checked);
        }
      },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { role: 'close' }
    ]
  }
  ]);
  Menu.setApplicationMenu(applicationMenu);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setMenu(applicationMenu);
  }
  return applicationMenu;
}

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, 'public', 'script.png')
    : path.join(app.getAppPath(), 'public', 'script.png');

  if (pendingProjectPath) {
    showSplash();
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    minWidth: 640,
    minHeight: 480,
    resizable: true,
    center: true,
    title: 'Scripture Inspectors',
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
  mainWindow.setMenu(applicationMenu);
  mainWindow.once('ready-to-show', () => {
    mainWindowReady = true;
    showMainWindow();
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

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    projectFileListenerReady = false;
    mainWindowReady = false;
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

  updateApplicationMenu();
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
