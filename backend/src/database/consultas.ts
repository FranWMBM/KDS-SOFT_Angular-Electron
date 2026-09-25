import sql from 'mssql';
import { conectar } from './connection';
import { MonitorCocina, ProductoMonitor } from '../tipos';

export const ESTADO_BUMPEADO = 2;

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
    WHERE ISNULL(pp.estadomonitor, 0) <> ${ESTADO_BUMPEADO}
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
  // Los bumpeados se quedan en el mapa (para que el monitor no los detecte
  // como "nuevos"), pero ya no se mandan a las pantallas que se conectan.
  return Array.from(registrosConocidos.values()).filter(
    (registro) => registro.estadomonitor !== ESTADO_BUMPEADO,
  );
}

// ========================================
// BUMP: MARCAR MOVIMIENTOS COMO PRODUCIDOS
// ========================================

// Devuelve solo los movimientos que realmente se actualizaron en la BD.
export async function bumpearMovimientos(
  folio: number,
  movimientos: number[],
  idMonitor: string,
  horaProduccion: Date,
): Promise<number[]> {
  const pool = await conectar();
  const hora = formatearFechaLocal(horaProduccion);

  const request = pool
    .request()
    .input('horaProduccion', sql.VarChar(23), hora)
    .input('idMonitor', sql.VarChar(5), idMonitor)
    .input('folio', sql.Int, folio);

  // mssql no acepta un arreglo en un solo parámetro: se genera @mov0, @mov1, ...
  const parametrosMovimiento = movimientos.map((movimiento, indice) => {
    request.input(`mov${indice}`, sql.Int, movimiento);
    return `@mov${indice}`;
  });

  // OUTPUT ... INTO (y no OUTPUT directo) para que funcione aunque la tabla
  // tenga triggers.
  const resultado = await request.query<{ movimiento: number }>(`
    DECLARE @actualizados TABLE (movimiento INT);

    UPDATE productosenproduccion
    SET estadomonitor = ${ESTADO_BUMPEADO},
        horaproduccion = @horaProduccion
    OUTPUT inserted.movimiento INTO @actualizados
    WHERE movimiento IN (${parametrosMovimiento.join(', ')})
      AND idmonitor = @idMonitor
      AND folio = @folio;

    SELECT movimiento FROM @actualizados;
  `);

  const actualizados = resultado.recordset.map((fila) => fila.movimiento);

  for (const movimiento of actualizados) {
    const registro = registrosConocidos.get(`${folio}-${movimiento}`);

    if (registro) {
      registro.estadomonitor = ESTADO_BUMPEADO;
      registro.horaproduccion = hora;
    }
  }

  return actualizados;
}

// Hora local en formato ISO sin zona ("2026-09-24T07:49:58.671"). Se manda
// como texto porque mssql convierte los Date a UTC y la hora quedaría
// desfasada respecto a la del servidor.
function formatearFechaLocal(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0');

  return (
    `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}` +
    `T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}` +
    `.${String(fecha.getMilliseconds()).padStart(3, '0')}`
  );
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
