const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

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




function obtenerRutaConfiguracion() {
  return path.join(app.getPath('userData'), 'config.json');
}

ipcMain.handle('configuracion:guardar', async (_, configuracion) => {
  try {
    const ruta = obtenerRutaConfiguracion();

    fs.writeFileSync(
      ruta,
      JSON.stringify(configuracion, null, 2),
      'utf-8'
    );

    console.log('Configuración guardada en:', ruta);

    return {
      correcto: true
    };

  } catch (error) {

    console.error('Error guardando configuración:', error);

    return {
      correcto: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

ipcMain.handle('configuracion:cargar', async () => {
  try {
    const ruta = obtenerRutaConfiguracion();

    if (!fs.existsSync(ruta)) {
      return null;
    }

    const contenido = fs.readFileSync(ruta, 'utf-8');

    return JSON.parse(contenido);

  } catch (error) {

    console.error('Error cargando configuración:', error);

    return null;
  }
});