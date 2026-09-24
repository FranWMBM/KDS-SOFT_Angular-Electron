export const ESTADO_BUMPEADO = 2;

export interface RegistrosBumpeados {
  idComanda: number;
  movimientos: number[];
  estado: number;
}
