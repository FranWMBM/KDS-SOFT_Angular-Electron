import { Component, inject } from '@angular/core';
import { ComandasService } from '../../servicios/ComandasService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bump-bar',
  imports: [],
  templateUrl: './bump-bar.html',
  styleUrl: './bump-bar.css',
})
export class BumpBar {
  srvComandas = inject(ComandasService);
  comandas = this.srvComandas.comandas;

  constructor(private router: Router) {}

  abrirConfiguracion(): void {
    this.router.navigate(['/configuracion']);
  }
}
