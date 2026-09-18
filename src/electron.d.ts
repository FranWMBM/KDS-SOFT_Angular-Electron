import { ProductoMonitor } from './app/interfaces/productosenproduccion';
import { ConfiguracionKDS } from './app/interfaces/configuracion';

export {};

declare global {
  interface Window {
    electronAPI?: {
      onNuevosRegistros(
        callback: (registros: ProductoMonitor[]) => void
      ): void;

      guardarConfiguracion(
        configuracion: ConfiguracionKDS
      ): Promise<{ correcto: boolean; error?: string }>;

      obtenerConfiguracion(): Promise<ConfiguracionKDS | null>;

      obtenerMonitores(): Promise<MonitorCocina[]>;
    };
  }
}