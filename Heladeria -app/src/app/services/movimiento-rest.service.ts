import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { API } from '../config/api.config';
import { Movimiento } from '../Model/movimiento';

/** Cliente Angular del servicio REST de inventario (HeladeriaREST). */
@Injectable({ providedIn: 'root' })
export class MovimientoRestService {
  private http = inject(HttpClient);

  obtenerMovimientos(idProducto = 0) {
    const url = API.rest + (idProducto ? `?idProducto=${idProducto}` : '');
    return firstValueFrom(this.http.get<Movimiento[]>(url).pipe(timeout(15000)));
  }

  obtenerMovimiento(id: number) {
    return firstValueFrom(this.http.get<Movimiento>(`${API.rest}/${id}`).pipe(timeout(15000)));
  }

  agregarMovimiento(movimiento: Movimiento) {
    return firstValueFrom(this.http.post<Movimiento>(API.rest, this.cuerpo(movimiento)).pipe(timeout(15000)));
  }

  actualizarMovimiento(movimiento: Movimiento) {
    return firstValueFrom(this.http.put<Movimiento>(`${API.rest}/${movimiento.idMovimiento}`, this.cuerpo(movimiento)).pipe(timeout(15000)));
  }

  eliminarMovimiento(id: number) {
    return firstValueFrom(this.http.delete(`${API.rest}/${id}`).pipe(timeout(15000)));
  }

  private cuerpo(m: Movimiento) {
    return { idProducto: m.idProducto, tipoMovimiento: m.tipoMovimiento, cantidad: m.cantidad, observacion: m.observacion };
  }
}
