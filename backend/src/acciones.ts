import { guardarBaseDatos, obtenerBaseDatos } from './configuracion-store';
import { obtenerMonitores, obtenerTodosLosRegistrosConocidos } from './database/consultas';
import { cerrarConexion } from './database/connection';
import { reiniciarMonitor } from './services/monitorRegistros';
import { ConfiguracionBaseDatos, FuncionBroadcast, MonitorCocina, ProductoMonitor, ResultadoGuardado } from './tipos';

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
