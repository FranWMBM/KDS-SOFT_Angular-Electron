import { guardarBaseDatos, obtenerBaseDatos } from './configuracion-store';
import {
  bumpearMovimientos,
  obtenerMonitores,
  obtenerTodosLosRegistrosConocidos,
} from './database/consultas';
import { cerrarConexion } from './database/connection';
import { reiniciarMonitor } from './services/monitorRegistros';
import {
  ConfiguracionBaseDatos,
  FuncionBroadcast,
  MonitorCocina,
  ProductoMonitor,
  ResultadoGuardado,
  SolicitudBump,
} from './tipos';

// Lógica de negocio compartida entre el WebSocket (canal principal, ver
// server.ts) y las rutas REST en routes/config.ts (se dejan disponibles
// por si en el futuro se necesita acceso por HTTP, pero hoy el frontend no
// las usa).

export function accionObtenerBaseDatos(): ConfiguracionBaseDatos | null {
  return obtenerBaseDatos();
}

export async function accionGuardarBaseDatos(
  datos: ConfiguracionBaseDatos,
  broadcast: FuncionBroadcast,
): Promise<ResultadoGuardado> {
  try {
    guardarBaseDatos(datos);

    // Descarta el pool que usaba las credenciales anteriores y reconecta.
    await cerrarConexion();
    await reiniciarMonitor(broadcast);

    return { correcto: true };
  } catch (error) {
    console.error('Error al guardar la configuración de base de datos:', error);

    return {
      correcto: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function accionObtenerMonitores(): Promise<MonitorCocina[]> {
  return obtenerMonitores();
}

export function accionObtenerRegistros(): ProductoMonitor[] {
  return obtenerTodosLosRegistrosConocidos();
}

// Marca como producidos los movimientos del folio en el monitor indicado.
// Lanza error (y el frontend no toca la pantalla) si los datos son
// inválidos o si no se actualizó ningún movimiento.
export async function accionBump(datos: unknown, horaRecepcion: Date): Promise<SolicitudBump> {
  const solicitud = datos as Partial<SolicitudBump> | null;

  if (
    !solicitud ||
    !Number.isInteger(solicitud.idComanda) ||
    !Array.isArray(solicitud.movimientos) ||
    solicitud.movimientos.length === 0 ||
    !solicitud.movimientos.every(Number.isInteger)
  ) {
    throw new Error('Datos de bump inválidos.');
  }

  if (!solicitud.idMonitor) {
    throw new Error('Esta pantalla no tiene un monitor configurado.');
  }

  const actualizados = await bumpearMovimientos(
    solicitud.idComanda!,
    solicitud.movimientos,
    solicitud.idMonitor,
    horaRecepcion,
  );

  if (actualizados.length === 0) {
    throw new Error(
      `No se bumpeó ningún movimiento del folio ${solicitud.idComanda} en el monitor ${solicitud.idMonitor}.`,
    );
  }

  // Se responde solo con los movimientos que sí se actualizaron.
  return { ...(solicitud as SolicitudBump), movimientos: actualizados };
}
