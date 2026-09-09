import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MovimientoRestService } from './movimiento-rest.service';
import { API } from '../config/api.config';

describe('MovimientoRestService', () => {
  let api: MovimientoRestService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(MovimientoRestService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('envía POST /api/movimientos sin una fecha vacía', async () => {
    const resultado = api.agregarMovimiento({ idMovimiento: 0, idProducto: 7, tipoMovimiento: 'Entrada', cantidad: 3, fechaMovimiento: '', observacion: 'Compra' });
    const req = http.expectOne(API.rest);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ idProducto: 7, tipoMovimiento: 'Entrada', cantidad: 3, observacion: 'Compra' });
    req.flush({ idMovimiento: 1 });
    await resultado;
  });
});
