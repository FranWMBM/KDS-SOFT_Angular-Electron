import { conectar } from './connection';
import { MonitorCocina, ProductoMonitor } from '../tipos';

// Mapa clave -> registro de todo lo que ya se detectó, para poder mandarle
// el estado completo a una pantalla que se conecta después de que algo ya
// se envió a las demás (el backend es una sola instancia compartida, ya no
// un proceso por pantalla que arranca en blanco cada vez).
const registrosConocidos = new Map<string, ProductoMonitor>();

async function obtenerRegistros(): Promise<ProductoMonitor[]> {
  const pool = await conectar();

  const resultado = await pool.request().query<ProductoMonitor>(`
    SELECT
      p.descripcion,
      pp.idproducto,
      pp.idmonitor,
      pp.folio,
      pp.movimiento,
      pp.cantidad,
      pp.comentario,
      pp.tiempo,
      pp.hora,
      pp.modificador,
      pp.estadomonitor,
      pp.idproductocompuesto,
      pp.productocompuestoprincipal,
      pp.minutospreparacion,
      pp.minutosalerta,
      pp.horaproduccion,
      pp.cancelado,
      pp.prioridad
    FROM productosenproduccion AS pp
    INNER JOIN productos AS p
      ON p.idproducto = pp.idproducto
    ORDER BY pp.movimiento
  `);

  return resultado.recordset;
}


// ========================================
// OBTENER CLAVE ÚNICA DEL REGISTRO
// ========================================

function obtenerClaveRegistro(registro: ProductoMonitor): string {
  return `${registro.folio}-${registro.movimiento}`;
}


// ========================================
// OBTENER SOLAMENTE LOS REGISTROS NUEVOS
// ========================================

export async function obtenerNuevosRegistros(): Promise<ProductoMonitor[]> {
  const registros = await obtenerRegistros();

  const nuevosRegistros: ProductoMonitor[] = [];

  for (const registro of registros) {

    const clave = obtenerClaveRegistro(registro);

    // Si ya lo conocíamos, no lo volvemos a mandar como "nuevo".
    if (registrosConocidos.has(clave)) {
      continue;
    }

    registrosConocidos.set(clave, registro);
    nuevosRegistros.push(registro);
  }

  return nuevosRegistros;
}


// ========================================
// ESTADO COMPLETO CONOCIDO HASTA AHORA
// (para sincronizar a una pantalla que se conecta después)
// ========================================

export function obtenerTodosLosRegistrosConocidos(): ProductoMonitor[] {
  return Array.from(registrosConocidos.values());
}


export function limpiarRegistrosProcesados(): void {
  registrosConocidos.clear();
}

export async function obtenerMonitores(): Promise<MonitorCocina[]> {
  const pool = await conectar();

  const resultado = await pool.request().query<MonitorCocina>(`
    SELECT idmonitor AS id, descripcion AS nombre
    FROM dbo.monitoresproduccion
    ORDER BY descripcion
  `);

  return resultado.recordset;
}
