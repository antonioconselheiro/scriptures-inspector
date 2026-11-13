const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('print menu and shortcut are available only in the preview', () => {
  const handlers = {};
  const printCalls = [];
  const errors = [];
  let menu;
  const sender = {
    send() {},
    print: (options, callback) => printCalls.push({ options, callback })
  };
  const window = { webContents: sender, isDestroyed: () => false, setMenu: value => { menu = value; } };
  const electron = {
    app: {
      requestSingleInstanceLock: () => true,
      on() {},
      whenReady: () => ({ then() {} }),
      isPackaged: false
    },
    protocol: {},
    net: {},
    BrowserWindow: function () {},
    dialog: { showErrorBox: (...args) => errors.push(args) },
    nativeImage: { createFromPath: () => ({ resize: () => ({}) }) },
    ipcMain: { handle: (name, callback) => { handlers[name] = callback; }, on() {} },
    Menu: {
      buildFromTemplate: template => ({ template }),
      setApplicationMenu: value => { menu = value; }
    }
  };
  const context = {
    require: name => name === 'electron/main' ? electron : require(name),
    process, console: { error() {} }, __dirname: path.resolve(__dirname, '..'), window
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8')
      + '\nmainWindow = window; updateApplicationMenu([{source: "a", label: "Codex A"}]);',
    context
  );
  const printItem = () => menu.template.find(item => item.label === 'File')
    .submenu.find(item => item.id === 'print-preview');

  assert.equal(printItem().enabled, false);
  assert.equal(printItem().accelerator, 'CommandOrControl+P');
  printItem().click();
  assert.equal(printCalls.length, 0);

  handlers['set-preview-active']({ sender }, true);
  assert.equal(printItem().enabled, true);
  printItem().click();
  assert.equal(printCalls.length, 1);
  assert.equal(printCalls[0].options.silent, false);
  assert.equal(printCalls[0].options.printBackground, true);
  printCalls[0].callback(false, 'Print job canceled');
  assert.equal(errors.length, 0);
  printCalls[0].callback(false, 'Print job failed');
  assert.equal(errors[0][1], 'Print job failed');

  handlers['update-codex-config-menu']({ sender }, [{ source: 'b', label: 'Codex B' }]);
  assert.equal(printItem().enabled, true);
  handlers['set-preview-active']({ sender }, false);
  assert.equal(printItem().enabled, false);
  printItem().click();
  assert.equal(printCalls.length, 1);
});
