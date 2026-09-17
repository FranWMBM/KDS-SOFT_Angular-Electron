export interface ConfiguracionKDS {
  servidor: string;
  baseDatos: string;
  usuario: string;
  contrasena: string;
  filasTicket: number;
  columnasPorPagina: number;
  filasPorPagina: number;
  monitorCocina: number | null;
  imagenMarcaAgua: string | null;
}