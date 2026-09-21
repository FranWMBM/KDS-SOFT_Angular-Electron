const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function obtenerUrlBackend() {
  if (process.env.KDS_BACKEND_URL) {
    return process.env.KDS_BACKEND_URL;
  }

  const rutaConfig = path.join(__dirname, 'host.config.json');

  if (fs.existsSync(rutaConfig)) {
    const { backendUrl } = JSON.parse(fs.readFileSync(rutaConfig, 'utf-8'));

    if (backendUrl) {
      return backendUrl;
    }
  }

  return 'http://localhost:3000';
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  mainWindow.loadURL(obtenerUrlBackend());

  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
