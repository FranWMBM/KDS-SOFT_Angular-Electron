import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ConfiguracionBaseDatos } from './tipos';

const CARPETA_DATOS = path.join(__dirname, '..', 'data');
const ARCHIVO_BASE_DATOS = path.join(CARPETA_DATOS, 'bd.config');

function obtenerClave(): Buffer {
  const clave = process.env['CONFIG_SECRET'];

  if (!clave || clave.length < 32) {
    throw new Error(
      'Define CONFIG_SECRET en backend/.env con al menos 32 caracteres antes de guardar credenciales.',
    );
  }

  // Deriva una clave AES-256 de 32 bytes a partir del secreto configurado.
  return crypto.createHash('sha256').update(clave).digest();
}

function cifrar(texto: string): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', obtenerClave(), iv);

  const cifrado = Buffer.concat([cipher.update(texto, 'utf-8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, cifrado]);
}

function descifrar(buffer: Buffer): string {
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const cifrado = buffer.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', obtenerClave(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString('utf-8');
}

export function guardarBaseDatos(datos: ConfiguracionBaseDatos): void {
  const conexion: ConfiguracionBaseDatos = {
    servidor: datos.servidor,
    baseDatos: datos.baseDatos,
    usuario: datos.usuario,
    contrasena: datos.contrasena,
  };

  fs.mkdirSync(CARPETA_DATOS, { recursive: true });
  fs.writeFileSync(ARCHIVO_BASE_DATOS, cifrar(JSON.stringify(conexion)));
}

export function obtenerBaseDatos(): ConfiguracionBaseDatos | null {
  if (!fs.existsSync(ARCHIVO_BASE_DATOS)) {
    return null;
  }

  const cifrado = fs.readFileSync(ARCHIVO_BASE_DATOS);

  return JSON.parse(descifrar(cifrado)) as ConfiguracionBaseDatos;
}

// Las credenciales ya no se cargan desde la app: se declaran en
// backend/.env (DB_SERVIDOR, DB_BASE_DATOS, DB_USUARIO, DB_CONTRASENA) y el
// backend las cifra y guarda al arrancar, igual que antes hacía el
// formulario de "Base de datos".
export function sembrarCredencialesDesdeEnv(): void {
  const { DB_SERVIDOR, DB_BASE_DATOS, DB_USUARIO, DB_CONTRASENA } = process.env;

  if (!DB_SERVIDOR || !DB_BASE_DATOS || !DB_USUARIO || !DB_CONTRASENA) {
    return;
  }

  guardarBaseDatos({
    servidor: DB_SERVIDOR,
    baseDatos: DB_BASE_DATOS,
    usuario: DB_USUARIO,
    contrasena: DB_CONTRASENA,
  });

  console.log('Credenciales de SQL Server cargadas desde backend/.env');
}
