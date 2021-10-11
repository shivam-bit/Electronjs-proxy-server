/* eslint-disable import/no-extraneous-dependencies */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    return mainWindow;
};

const createWorkerWindow = () => {
    const workerWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    workerWindow.loadFile(path.join(__dirname, 'worker.html'));
    return workerWindow;
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    const mainWindow = createMainWindow();
    const workerWindow = createWorkerWindow();
    ipcMain.on('port-number-transfer', (event, arg) => {
        mainWindow.webContents.send('receive-port-number', arg);
    });
    ipcMain.on('proxy-server-status', (event, arg) => {
        mainWindow.webContents.send('proxy-server-status', arg);
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        const mainWindow = createMainWindow();
        const workerWindow = createWorkerWindow();
        ipcMain.on('port-number-transfer', (event, arg) => {
            mainWindow.webContents.send('receive-port-number', arg);
        });
        ipcMain.on('proxy-server-status', (event, arg) => {
            mainWindow.webContents.send('proxy-server-status', arg);
        });
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
