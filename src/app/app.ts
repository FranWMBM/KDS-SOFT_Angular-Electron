import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PantallaComandas } from "./componentes/pantalla-comandas/pantalla-comandas";

@Component({
  selector: 'app-root',
  imports: [PantallaComandas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('KDS-SR');
}
