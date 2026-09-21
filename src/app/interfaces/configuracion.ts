export interface ConfiguracionPantalla {
  filasTicket: number;
  columnasPorPagina: number;
  filasPorPagina: number;
  // idmonitor es varchar(5) en la base de datos (ej. "01", "02"), no numérico.
  monitorCocina: string | null;
  imagenMarcaAgua: string | null;
  /** Ancho de la marca de agua, en píxeles. */
  tamanoMarcaAgua: number;
  /** Tamaño de letra de la descripción del producto en cada fila, en píxeles. */
  tamanoLetraDescripcion: number;
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
