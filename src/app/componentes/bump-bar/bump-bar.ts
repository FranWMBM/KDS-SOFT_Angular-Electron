import { Component, inject } from '@angular/core';
import { ComandasService } from '../../servicios/ComandasService';

@Component({
  selector: 'app-bump-bar',
  imports: [],
  templateUrl: './bump-bar.html',
  styleUrl: './bump-bar.css',
})
export class BumpBar {

  srvComandas = inject(ComandasService);
  comandas = this.srvComandas.comandas;

}
