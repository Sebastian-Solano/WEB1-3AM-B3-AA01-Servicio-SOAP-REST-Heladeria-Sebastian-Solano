import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductoSoapService } from './producto-soap.service';
import { escapeXml, leerSoap } from './soap.util';
import { API } from '../config/api.config';

describe('ProductoSoapService', () => {
  let api: ProductoSoapService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ProductoSoapService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('escapa caracteres XML y reconoce SOAP Fault', () => {
    expect(escapeXml('Fresa & <crema>')).toBe('Fresa &amp; &lt;crema&gt;');
    expect(() => leerSoap('<Envelope><Fault><faultstring>Stock inválido</faultstring></Fault></Envelope>')).toThrow('Stock inválido');
  });
  it('envía SOAPAction AgregarProducto como en Postman', async () => {
    const resultado = api.agregarProducto({ idProducto: 0, nombre: 'A & B', descripcion: 'Prueba', precio: 1, stock: 1, idCategoria: 1, estado: true });
    const req = http.expectOne(API.soap);
    expect(req.request.headers.get('SOAPAction')).toContain('AgregarProducto');
    expect(req.request.body).toContain('<d:Nombre>A &amp; B</d:Nombre>');
    req.flush('<Envelope><Body><AgregarProductoResponse/></Body></Envelope>');
    await resultado;
  });
  it('interpreta productos SOAP sin depender del prefijo XML', async () => {
    const resultado = api.obtenerProductos();
    http.expectOne(API.soap).flush('<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:z="urn:test"><s:Body><z:Producto><z:IdProducto>7</z:IdProducto><z:Nombre>Chocolate</z:Nombre><z:Precio>3.25</z:Precio><z:Stock>9</z:Stock><z:Estado>true</z:Estado></z:Producto></s:Body></s:Envelope>');
    expect((await resultado)[0]).toMatchObject({ idProducto: 7, precio: 3.25, stock: 9, estado: true });
  });
});
