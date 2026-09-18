export interface ConfiguracionPantalla {
  filasTicket: number;
  columnasPorPagina: number;
  filasPorPagina: number;
  monitorCocina: number | null;
  imagenMarcaAgua: string | null;
}

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