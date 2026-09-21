import sql from 'mssql';
import { obtenerBaseDatos } from '../configuracion-store';

function obtenerConfiguracionSQL(): sql.config {
  const configuracion = obtenerBaseDatos();

  if (!configuracion) {
    throw new Error('Primero configura la conexión a la base de datos.');
  }

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

let pool: sql.ConnectionPool | null = null;

export async function conectar(): Promise<sql.ConnectionPool> {
  if (pool) return pool;

  const nuevoPool = new sql.ConnectionPool(obtenerConfiguracionSQL());

  nuevoPool.on('error', (error) => {
    console.error('Error en el pool de SQL Server:', error);
  });

  pool = await nuevoPool.connect();
  console.log('Conectado a la BD');

  return pool;
}

export async function cerrarConexion(): Promise<void> {
  if (!pool) return;

  const poolAnterior = pool;
  pool = null;
  await poolAnterior.close();
}
