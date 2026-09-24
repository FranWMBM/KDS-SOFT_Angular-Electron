export const ESTADO_BUMPEADO = 2;

export interface RegistrosBumpeados {
  idComanda: number;
  movimientos: number[];
  estado: number;
  // idmonitor es varchar(5) en la BD (ej. "01"); null si no hay monitor configurado.
  idMonitor: string | null;
}
