const sql = require('mssql');
const { app } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

function obtenerConfiguracionSQL() {
  const ruta = path.join(app.getPath('userData'), 'config.json');
  const configuracion = JSON.parse(fs.readFileSync(ruta, 'utf-8'));

  return {
    user: configuracion.usuario,
    password: configuracion.contrasena,
    server: configuracion.servidor,
    port: 1433,
    database: configuracion.baseDatos,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}


// const config = {
//     user: 'sa',
//     password: 'National09',
//     server: 'TERMINAL-S8',
//     port: 1433,
//     database: 'softrestaurant8pro',
//     options: {
//         encrypt: false,
//         trustServerCertificate: true
//     }
// };

let pool;

// async function conectar() {

//     if (pool) {
//         return pool;
//     }

//     pool = await sql.connect(obtenerConfiguracionSQL());

//     console.log('Conectado a la BD');

//     return pool;
// }

async function conectar() {
  if (pool) return pool;

  const nuevoPool = new sql.ConnectionPool(obtenerConfiguracionSQL());

  nuevoPool.on('error', (error) => {
    console.error('Error en el pool de SQL Server:', error);
  });

  pool = await nuevoPool.connect();
  console.log('Conectado a la BD');

  return pool;
}

async function cerrarConexion() {
  if (!pool) return;

  const poolAnterior = pool;
  pool = null;
  await poolAnterior.close();
}

module.exports = {
    conectar,
    cerrarConexion
};