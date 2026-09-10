const { conectar } = require('./connection');

const registrosProcesados = new Set();

async function obtenerRegistros() {
  const pool = await conectar();

  const resultado = await pool.request().query(`
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

function obtenerClaveRegistro(registro) {
  return `${registro.folio}-${registro.movimiento}`;
}


// ========================================
// OBTENER SOLAMENTE LOS REGISTROS NUEVOS
// ========================================

async function obtenerNuevosRegistros() {
  const registros = await obtenerRegistros();

  const nuevosRegistros = [];

  for (const registro of registros) {

    const clave = obtenerClaveRegistro(registro);

    // Si ya procesamos este folio + movimiento,
    // no lo volvemos a enviar.
    if (registrosProcesados.has(clave)) {
      continue;
    }

    // Lo agregamos a los procesados
    registrosProcesados.add(clave);

    // Lo agregamos a los nuevos
    nuevosRegistros.push(registro);
  }

  return nuevosRegistros;
}


// ========================================
// POLLING
// ========================================

async function revisarRegistros() {
  try {

    const nuevosRegistros = await obtenerNuevosRegistros();

    if (nuevosRegistros.length === 0) {
      return;
    }

    console.log('Nuevos registros:', nuevosRegistros);

    // Aquí posteriormente puedes enviarlos a Angular
    // mediante webContents.send()

    // Ejemplo:
    //
    // mainWindow.webContents.send(
    //   'nuevos-registros',
    //   nuevosRegistros
    // );

  } catch (error) {

    console.error(
      'Error al consultar nuevos registros:',
      error
    );
  }
}

module.exports = {
  obtenerNuevosRegistros,
};
