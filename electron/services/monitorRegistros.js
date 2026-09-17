const { obtenerNuevosRegistros, limpiarRegistrosProcesados } = require('../database/consultas');

let mainWindow = null;
let activo = false;
let temporizador = null;
let consultaEnCurso = null;
let generacion = 0;

async function consultar() {
  if (!activo || consultaEnCurso) return;

  const generacionDeEstaConsulta = generacion;

  consultaEnCurso = (async () => {
    try {
      const registros = await obtenerNuevosRegistros();

      // Si se detuvo mientras esperaba a la BD, descarta el resultado.
      if (!activo || generacionDeEstaConsulta !== generacion) return;

      if (registros.length > 0 && mainWindow && !mainWindow.isDestroyed()) {
        //console.log('Nuevos registros:', registros);
        mainWindow.webContents.send('nuevos-registros', registros);
      }
    } catch (error) {
      console.error('Error consultando nuevos registros:', error);
    }
  })();

  try {
    await consultaEnCurso;
  } finally {
    consultaEnCurso = null;

    // Espera 2 segundos desde que terminó antes de consultar otra vez.
    if (activo && generacionDeEstaConsulta === generacion) {
      temporizador = setTimeout(consultar, 2000);
    }
  }
}

async function iniciarMonitor(ventana) {
  if (activo) return;

  const generacionAlIniciar = generacion;

  // Nunca iniciar otra consulta mientras una anterior siga pendiente.
  if (consultaEnCurso) {
    await consultaEnCurso;
  }

  if (generacionAlIniciar !== generacion) return;

  mainWindow = ventana;
  activo = true;
  console.log('Monitor de registros iniciado');

  consultar();
}

async function detenerMonitor() {
  activo = false;
  generacion++;

  if (temporizador) {
    clearTimeout(temporizador);
    temporizador = null;
  }

  // No termina hasta que la consulta actual haya finalizado.
  if (consultaEnCurso) {
    await consultaEnCurso;
  }

  limpiarRegistrosProcesados();
  console.log('Monitor de registros detenido');
}

async function reiniciarMonitor(ventana = mainWindow) {
  await detenerMonitor();
  await iniciarMonitor(ventana);
}

module.exports = {
  iniciarMonitor,
  detenerMonitor,
  reiniciarMonitor,
};