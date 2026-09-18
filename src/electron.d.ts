import { ProductoMonitor } from './app/interfaces/productosenproduccion';
import { ConfiguracionPantalla, ConfiguracionBaseDatos, ResultadoGuardado } from './app/interfaces/configuracion';

export {};

declare global {
  interface Window {
    electronAPI?: {
      onNuevosRegistros(callback: (registros: ProductoMonitor[]) => void): void;

      guardarBaseDatos(datos: ConfiguracionBaseDatos): Promise<ResultadoGuardado>;

      obtenerBaseDatos(): Promise<ConfiguracionBaseDatos | null>;

      guardarPantalla(datos: ConfiguracionPantalla): Promise<ResultadoGuardado>;

      obtenerPantalla(): Promise<ConfiguracionPantalla | null>;

      obtenerMonitores(): Promise<MonitorCocina[]>;

      obtenerMonitores(): Promise<MonitorCocina[]>;
    };
  }
}
