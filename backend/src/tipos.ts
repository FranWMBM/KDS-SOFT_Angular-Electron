// Estas formas reflejan las interfaces equivalentes del frontend
// (src/app/interfaces/*.ts). No se comparten literalmente entre los dos
// proyectos (evita depender de rutas fuera de cada raíz de compilación);
// si llegan a divergir, es porque uno de los dos lados cambió su contrato.

export interface ConfiguracionBaseDatos {
  servidor: string;
  baseDatos: string;
  usuario: string;
  contrasena: string;
}

export interface ResultadoGuardado {
  correcto: boolean;
  error?: string;
}

export interface MonitorCocina {
  id: string;
  nombre: string;
}

export interface ProductoMonitor {
  descripcion: string;
  idproducto: string;
  idmonitor: string;
  folio: number;
  movimiento: number;
  cantidad: number;
  comentario: string;
  tiempo?: string;
  hora?: string;
  modificador?: boolean;
  estadomonitor?: number;
  idproductocompuesto?: string;
  productocompuestoprincipal: boolean;
  minutospreparacion?: number;
  minutosalerta?: number;
  horaproduccion?: string | null;
  cancelado?: boolean | null;
  prioridad?: string;
}

// Protocolo del WebSocket (ver server.ts): el cliente manda una "acción" con
// un id de correlación, el backend responde con el mismo id.
export interface MensajeEntrante {
  id?: string;
  accion?: string;
  datos?: unknown;
}

export type FuncionBroadcast = (registros: ProductoMonitor[]) => void;

// Equivalente a RegistrosBumpeados del frontend. idComanda es el folio.
export interface SolicitudBump {
  idComanda: number;
  movimientos: number[];
  estado: number;
  idMonitor: string | null;
}
