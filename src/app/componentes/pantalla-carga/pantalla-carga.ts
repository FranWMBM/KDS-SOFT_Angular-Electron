import { Component, inject } from '@angular/core';
import { CargandoService } from '../../servicios/cargando-service';

@Component({
  selector: 'app-pantalla-carga',
  imports: [],
  templateUrl: './pantalla-carga.html',
  styleUrl: './pantalla-carga.css',
})
export class PantallaCarga {
  srvCargando = inject(CargandoService);
}
