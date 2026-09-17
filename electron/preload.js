const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNuevosRegistros: (callback) => {
    ipcRenderer.on('nuevos-registros', (_event, registros) => {
      callback(registros);
    });
  },

  guardarConfiguracion: (configuracion) =>
    ipcRenderer.invoke('configuracion:guardar', configuracion),
});