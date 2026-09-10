export interface ProductoMonitor {
  descripcion: string;
  idproducto: string;
  idmonitor: string;
  folio: number;
  movimiento: number;
  cantidad: number;
  comentario: string;
  tiempo: string | undefined;
  hora: string | undefined;
  modificador: boolean | undefined;
  estadomonitor: number | undefined;
  idproductocompuesto: string | undefined;
  productocompuestoprincipal: boolean;
  minutospreparacion: number | undefined;
  minutosalerta: number | undefined;
  horaproduccion: string | undefined;
  cancelado: boolean | undefined;
  prioridad: string | undefined;
  enviadomonitor: boolean | undefined;
}
