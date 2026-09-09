import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ProductoSoapService } from './services/producto-soap.service';
import { MovimientoRestService } from './services/movimiento-rest.service';
import { CatalogoExternoService } from './services/catalogo-externo.service';

describe('Integración del panel', () => {
  const soap = {
    obtenerCategorias: vi.fn().mockResolvedValue([{ idCategoria: 1, nombre: 'Helados', descripcion: '', estado: true }]),
    obtenerProductos: vi.fn().mockResolvedValue([{ idProducto: 1, nombre: 'Vainilla', descripcion: '', precio: 2.5, stock: 10, idCategoria: 1, estado: true }])
  };
  const rest = { obtenerMovimientos: vi.fn().mockResolvedValue([]) };
  const externa = { obtenerCatalogo: vi.fn() };
  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ProductoSoapService, useValue: soap },
        { provide: MovimientoRestService, useValue: rest },
        { provide: CatalogoExternoService, useValue: externa }
      ]
    }).compileComponents();
  });
  it('muestra los productos recibidos del servicio y su categoría', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable(); fixture.detectChanges();
    expect(soap.obtenerProductos).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vainilla');
    expect(fixture.nativeElement.textContent).toContain('Helados');
    expect(fixture.componentInstance.totalStock()).toBe(10);
  });
  it('presenta error recuperable de la API externa sin datos ficticios de respaldo', async () => {
    externa.obtenerCatalogo.mockRejectedValueOnce(new Error('Catálogo no disponible'));
    const fixture = TestBed.createComponent(App);
    await fixture.componentInstance.consultarExterna();
    expect(fixture.componentInstance.errorExterno()).toContain('Catálogo no disponible');
    expect(fixture.componentInstance.externos()).toEqual([]);
    expect(fixture.componentInstance.consultando()).toBe(false);
  });
  it('muestra la relación categoría-producto', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance.navegar('categorias');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Helados');
    expect(fixture.nativeElement.textContent).toContain('1 producto(s) relacionados');
  });
});
