// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// let mainWindow;

// function createWindow() {

//   mainWindow = new BrowserWindow({
//     width: 1280,
//     height: 800,
//     webPreferences: {
//       contextIsolation: true,
//       nodeIntegration: false
//     }
//   });

//   mainWindow.loadFile(
//     path.join(__dirname, '../dist/KDS-SR/browser/index.html')
//   );

//   // Opcional durante desarrollo
//   // mainWindow.webContents.openDevTools();
// }

// app.whenReady().then(() => {
//   createWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

const { app, BrowserWindow } = require('electron');
const path = require('path');

const { iniciarMonitor } = require('./services/monitorRegistros');

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // // Desarrollo
    // mainWindow.loadURL('http://localhost:4200');

    // Producción sería algo como:
    mainWindow.loadFile(
        path.join(__dirname, '../dist/KDS-SR/browser/index.html')
    );

    return mainWindow;
}

app.whenReady().then(() => {

    createWindow();

    // Iniciar consulta periódica de la BD
    iniciarMonitor(mainWindow);

});

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }

});