const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');

const isDev = !app.isPackaged;
// if (isDev) {
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('no-sandbox');
  app.disableHardwareAcceleration();
// }

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

//  if (isDev) {
    // DEV
    mainWindow.loadURL('http://localhost:4205');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
//  } else {
//    // PROD
//    mainWindow.loadFile(
//      path.join(__dirname, 'dist/index.html')
//    );
//  }
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