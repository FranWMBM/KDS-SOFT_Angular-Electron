import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PantallaComandas } from './componentes/pantalla-comandas/pantalla-comandas';
import { PantallaCarga } from './componentes/pantalla-carga/pantalla-carga';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PantallaCarga],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('KDS-SR');
}
