import { obtenerNuevosRegistros, limpiarRegistrosProcesados } from '../database/consultas';
import { FuncionBroadcast } from '../tipos';

let enviarRegistros: FuncionBroadcast | null = null;
let activo = false;
let temporizador: ReturnType<typeof setTimeout> | null = null;
let consultaEnCurso: Promise<void> | null = null;
let generacion = 0;

async function consultar(): Promise<void> {
  if (!activo || consultaEnCurso) return;

  const generacionDeEstaConsulta = generacion;

  consultaEnCurso = (async () => {
    try {
      const registros = await obtenerNuevosRegistros();

      // Si se detuvo mientras esperaba a la BD, descarta el resultado.
      if (!activo || generacionDeEstaConsulta !== generacion) return;

      if (registros.length > 0 && enviarRegistros) {
        enviarRegistros(registros);
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

export async function iniciarMonitor(broadcast: FuncionBroadcast): Promise<void> {
  if (activo) return;

  const generacionAlIniciar = generacion;

  // Nunca iniciar otra consulta mientras una anterior siga pendiente.
  if (consultaEnCurso) {
    await consultaEnCurso;
  }

  if (generacionAlIniciar !== generacion) return;

  enviarRegistros = broadcast;
  activo = true;
  console.log('Monitor de registros iniciado');

  consultar();
}

export async function detenerMonitor(): Promise<void> {
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

export async function reiniciarMonitor(broadcast: FuncionBroadcast = enviarRegistros!): Promise<void> {
  await detenerMonitor();
  await iniciarMonitor(broadcast);
}
