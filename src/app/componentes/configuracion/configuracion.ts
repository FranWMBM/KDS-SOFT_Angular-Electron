import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Pantalla } from './pantalla/pantalla';

@Component({
  selector: 'app-configuracion',
  imports: [Pantalla],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  private readonly router = inject(Router);

  cerrarConfiguracion(): void {
    this.router.navigate(['/pantalla-comandas']);
  }
}
