import { ProductoMonitor } from './app/interfaces/productosenproduccion';

export {};

declare global {

  interface Window {

    electronAPI: {

      onNuevosRegistros(
        callback: (
          registros: ProductoMonitor[]
        ) => void
      ): void;

    };

  }

}