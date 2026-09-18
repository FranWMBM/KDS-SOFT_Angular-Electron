const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNuevosRegistros: (callback) => {
    ipcRenderer.on('nuevos-registros', (_event, registros) => {
      callback(registros);
    });
  },

  // guardarConfiguracion: (configuracion) =>
  //   ipcRenderer.invoke('configuracion:guardar', configuracion),

  // obtenerConfiguracion: () => ipcRenderer.invoke('configuracion:obtener'),

  // obtenerMonitores: () => ipcRenderer.invoke('monitores:obtener'),

  guardarBaseDatos: (datos) => ipcRenderer.invoke('guardar-base-datos', datos),

  obtenerBaseDatos: () => ipcRenderer.invoke('obtener-base-datos'),

  guardarPantalla: (datos) => ipcRenderer.invoke('guardar-pantalla', datos),

  obtenerPantalla: () => ipcRenderer.invoke('obtener-pantalla'),
});
