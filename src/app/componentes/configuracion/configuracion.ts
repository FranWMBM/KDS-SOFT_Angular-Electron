import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BaseDatos } from './base-datos/base-datos';
import { Pantalla } from './pantalla/pantalla';

@Component({
  selector: 'app-configuracion',
  imports: [BaseDatos, Pantalla],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  private readonly router = inject(Router);

  readonly pestanaActiva = signal<'baseDatos' | 'pantalla'>('baseDatos');

  conexionGuardada(): void {
    // Al abrir Pantalla se crea ese componente y consulta los monitores
    // usando las credenciales que se acaban de guardar.
    this.pestanaActiva.set('pantalla');
  }

  cerrarConfiguracion(): void {
    this.router.navigate(['/pantalla-comandas']);
  }
}
