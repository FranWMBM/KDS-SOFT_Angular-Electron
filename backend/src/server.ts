import 'dotenv/config';

import path from 'node:path';
import http from 'node:http';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';

import { crearRouterConfig } from './routes/config';
import { iniciarMonitor } from './services/monitorRegistros';
import { sembrarCredencialesDesdeEnv } from './configuracion-store';
import { accionObtenerMonitores, accionObtenerRegistros } from './acciones';
import { MensajeEntrante, ProductoMonitor } from './tipos';

const PUERTO = process.env['PORT'] || 3000;
const CARPETA_BUILD_ANGULAR = path.join(__dirname, '..', '..', 'dist', 'KDS-SR', 'browser');

const app = express();
const servidorHttp = http.createServer(app);
const wss = new WebSocketServer({ server: servidorHttp, path: '/ws' });

function broadcast(evento: string, datos: ProductoMonitor[]): void {
  const mensaje = JSON.stringify({ evento, datos });

  for (const cliente of wss.clients) {
    if (cliente.readyState === WebSocket.OPEN) {
      cliente.send(mensaje);
    }
  }
}

function responder(
  cliente: WebSocket,
  id: string | undefined,
  evento: string,
  datos: unknown,
): void {
  cliente.send(JSON.stringify({ id, evento, datos }));
}

function responderError(cliente: WebSocket, id: string | undefined, error: unknown): void {
  cliente.send(
    JSON.stringify({ id, error: error instanceof Error ? error.message : String(error) }),
  );
}

// Canal principal de la app: cada pantalla KDS manda "acciones" y el
// backend responde con el mismo "id" para que el cliente sepa qué
// respuesta corresponde a qué pedido. Los eventos sin "id" (nuevos-registros
// y el registros-actuales que se manda apenas se conecta) son push, no
// respuesta a nada puntual.
wss.on('connection', (cliente) => {
  cliente.send(JSON.stringify({ evento: 'registros-actuales', datos: accionObtenerRegistros() }));

  cliente.on('message', async (mensajeCrudo) => {
    let mensaje: MensajeEntrante;

    try {
      mensaje = JSON.parse(mensajeCrudo.toString());
    } catch {
      return;
    }

    const { id, accion, datos } = mensaje;

    try {
      switch (accion) {
        case 'obtener-monitores':
          responder(cliente, id, 'monitores', await accionObtenerMonitores());
          break;

        case 'obtener-registros':
          responder(cliente, id, 'registros-actuales', accionObtenerRegistros());
          break;
        case 'bump':
          // TEMPORAL: retraso para poder ver la pantalla de carga. Quitar después.
          await new Promise((resolver) => setTimeout(resolver, 5000));
          responder(cliente, id, 'respuesta-bump', datos);
          console.log(datos);
          break;
      }
    } catch (error) {
      console.error(`Error procesando la acción "${accion}":`, error);
      responderError(cliente, id, error);
    }
  });
});

app.use(express.json());
app.use(
  '/api',
  crearRouterConfig((registros) => broadcast('nuevos-registros', registros)),
);
app.use(express.static(CARPETA_BUILD_ANGULAR));

// Cualquier ruta no reconocida cae en index.html (rutas de Angular).
app.get('*', (_req, res) => {
  res.sendFile(path.join(CARPETA_BUILD_ANGULAR, 'index.html'));
});

sembrarCredencialesDesdeEnv();

servidorHttp.listen(PUERTO, () => {
  console.log(`Backend KDS-SR escuchando en http://localhost:${PUERTO}`);
});

iniciarMonitor((registros) => broadcast('nuevos-registros', registros));
