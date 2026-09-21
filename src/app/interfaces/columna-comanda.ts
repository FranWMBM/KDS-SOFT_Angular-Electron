import { ColumnaModel } from './columna';
import { ComandaModel } from './comanda';

export interface ColumnaMonitor {
  comanda: ComandaModel;
  columna: ColumnaModel;
  indiceColumna: number;
}
