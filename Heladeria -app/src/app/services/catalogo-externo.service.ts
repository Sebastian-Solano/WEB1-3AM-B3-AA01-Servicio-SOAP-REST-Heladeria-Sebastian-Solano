import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { API } from '../config/api.config';
import { Externo } from '../Model/externo';

@Injectable({ providedIn: 'root' })
export class CatalogoExternoService {
  private http = inject(HttpClient);

  obtenerCatalogo() {
    return firstValueFrom(this.http.get<{ products: Externo[] }>(API.externa).pipe(timeout(15000)));
  }
}
