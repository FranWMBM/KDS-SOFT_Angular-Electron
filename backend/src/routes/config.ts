import express, { Router } from 'express';
import {
  accionObtenerBaseDatos,
  accionGuardarBaseDatos,
  accionObtenerMonitores,
  accionObtenerRegistros,
} from '../acciones';
import { FuncionBroadcast } from '../tipos';

// El frontend habla con el backend por WebSocket (ver server.ts); estas
// rutas quedan disponibles como API REST por si en el futuro se necesita
// acceso desde afuera (otra integración, un script, debugging), pero hoy
// nadie las llama.
export function crearRouterConfig(broadcast: FuncionBroadcast): Router {
  const router = express.Router();

  router.get('/config/base-datos', (_req, res) => {
    try {
      res.json(accionObtenerBaseDatos());
    } catch (error) {
      console.error('Error al leer la configuración de base de datos:', error);

      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  });

  router.post('/config/base-datos', async (req, res) => {
    res.json(await accionGuardarBaseDatos(req.body, broadcast));
  });

  router.get('/registros', (_req, res) => {
    res.json(accionObtenerRegistros());
  });

  router.get('/monitores', async (_req, res) => {
    try {
      res.json(await accionObtenerMonitores());
    } catch (error) {
      console.error('Error al obtener monitores:', error);

      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  });

  return router;
}
