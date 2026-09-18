const { app, safeStorage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

function rutaArchivo(nombre) {
  return path.join(app.getPath('userData'), nombre);
}

function guardarBaseDatos(datos) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('El cifrado del sistema no está disponible.');
  }

  const conexion = {
    servidor: datos.servidor,
    baseDatos: datos.baseDatos,
    usuario: datos.usuario,
    contrasena: datos.contrasena,
  };

  const cifrado = safeStorage.encryptString(JSON.stringify(conexion));

  // Buffer binario: bd.config no será JSON legible.
  fs.writeFileSync(rutaArchivo('bd.config'), cifrado);
}

function obtenerBaseDatos() {
  const ruta = rutaArchivo('bd.config');

  if (!fs.existsSync(ruta)) {
    return null;
  }

  const cifrado = fs.readFileSync(ruta);
  const texto = safeStorage.decryptString(cifrado);

  return JSON.parse(texto);
}

function guardarPantalla(datos) {
  const pantalla = {
    filasTicket: datos.filasTicket,
    columnasPorPagina: datos.columnasPorPagina,
    filasPorPagina: datos.filasPorPagina,
    monitorCocina: datos.monitorCocina,
    imagenMarcaAgua: datos.imagenMarcaAgua,
  };

  fs.writeFileSync(
    rutaArchivo('config.json'),
    JSON.stringify(pantalla, null, 2),
    'utf-8',
  );
}

function obtenerPantalla() {
  const ruta = rutaArchivo('config.json');

  if (!fs.existsSync(ruta)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
}

module.exports = {
  guardarBaseDatos,
  obtenerBaseDatos,
  guardarPantalla,
  obtenerPantalla,
};