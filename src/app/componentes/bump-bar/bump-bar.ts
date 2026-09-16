import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavegacionService } from '../../servicios/NavegacionService';

@Component({
  selector: 'app-bump-bar',
  imports: [],
  templateUrl: './bump-bar.html',
  styleUrl: './bump-bar.css',
})
export class BumpBar {
  srvNavegacion = inject(NavegacionService);

  constructor(private router: Router) {}

  abrirConfiguracion(): void {
    this.router.navigate(['/configuracion']);
  }
}
