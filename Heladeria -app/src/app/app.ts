import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Categoria } from './Model/categoria';
import { Producto } from './Model/producto';
import { Movimiento } from './Model/movimiento';
import { Externo } from './Model/externo';
import { ProductoSoapService } from './services/producto-soap.service';
import { MovimientoRestService } from './services/movimiento-rest.service';
import { CatalogoExternoService } from './services/catalogo-externo.service';

type Pagina = 'productos' | 'categorias' | 'movimientos' | 'externa';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private soap = inject(ProductoSoapService);
  private rest = inject(MovimientoRestService);
  private externa = inject(CatalogoExternoService);
  private avisoTimer?: ReturnType<typeof setTimeout>;
  pagina = signal<Pagina>('productos');
  categorias = signal<Categoria[]>([]);
  productos = signal<Producto[]>([]);
  movimientos = signal<Movimiento[]>([]);
  externos = signal<Externo[]>([]);
  ocupado = signal(false);
  consultando = signal(false);
  mensaje = signal('');
  error = signal('');
  errorExterno = signal('');
  consultado = signal(false);
  busqueda = signal('');
  busquedaCategoria = signal('');
  categoriaSeleccionada = signal(0);
  soloBajo = signal(false);
  orden = signal<'nombre' | 'precio' | 'stock'>('nombre');
  filtroMovimiento = 0;
  referenciaLocal = 0;
  busquedaExterna = '';
  modal = '';
  confirmacion: { titulo: string; texto: string; accionTexto: string; ejecutar: () => void } | null = null;
  producto: Producto = this.productoVacio();
  categoria: Categoria = this.categoriaVacia();
  movimiento: Movimiento = this.movimientoVacio();
  readonly vistas: Record<Pagina, { eyebrow: string; titulo: string; texto: string }> = {
    productos: { eyebrow: 'Catálogo', titulo: 'Sabores y productos', texto: 'Cada producto pertenece a una categoría. Consulta, registra y actualiza el menú.' },
    categorias: { eyebrow: 'Organización', titulo: 'Categorías', texto: 'Agrupan los productos del menú. Ver productos abre el catálogo filtrado.' },
    movimientos: { eyebrow: 'Inventario', titulo: 'Movimientos', texto: 'Las entradas suman existencias y las salidas las descuentan. El stock se actualiza al guardar.' },
    externa: { eyebrow: 'Referencias', titulo: 'Catálogo externo', texto: 'Insumos y alimentos de referencia para comparar con el inventario de la heladería.' }
  };
  productosFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const cat = this.categoriaSeleccionada();
    const bajo = this.soloBajo();
    const lista = this.productos().filter(p =>
      (!cat || p.idCategoria === cat) &&
      (!bajo || (p.estado && p.stock <= 10)) &&
      `${p.nombre} ${p.descripcion}`.toLowerCase().includes(q)
    );
    const orden = this.orden();
    return [...lista].sort((a, b) => {
      if (orden === 'precio') return b.precio - a.precio;
      if (orden === 'stock') return a.stock - b.stock;
      return a.nombre.localeCompare(b.nombre, 'es');
    });
  });
  categoriasFiltradas = computed(() => {
    const q = this.busquedaCategoria().trim().toLowerCase();
    return this.categorias().filter(c => `${c.nombre} ${c.descripcion}`.toLowerCase().includes(q));
  });
  activos = computed(() => this.productos().filter(p => p.estado));
  totalStock = computed(() => this.activos().reduce((t, p) => t + p.stock, 0));
  valorInventario = computed(() => this.activos().reduce((t, p) => t + p.precio * p.stock, 0));
  stockBajo = computed(() => this.activos().filter(p => p.stock <= 10).length);

  async ngOnInit() { await this.recargar(); }
  ngOnDestroy() { clearTimeout(this.avisoTimer); }

  @HostListener('document:keydown.escape')
  cerrarConEscape() { this.cerrarOverlay(); }

  cerrarOverlay() {
    if (this.ocupado()) return;
    if (this.confirmacion) { this.confirmacion = null; return; }
    this.modal = '';
  }

  vista() { return this.vistas[this.pagina()]; }

  private descripcionError(e: unknown): string {
    if (e instanceof HttpErrorResponse) return e.error?.mensaje || e.error?.detail || (e.status === 0 ? 'No se pudo conectar. Compruebe los servicios y la configuración CORS.' : `Error HTTP ${e.status}. Revise los servicios y SQL Server.`);
    return e instanceof Error ? e.message : 'No se pudo completar la operación.';
  }

  async ejecutar(accion: () => Promise<unknown>, exito = '') {
    if (this.ocupado()) return;
    this.ocupado.set(true); this.error.set(''); this.mensaje.set('');
    try {
      await accion();
      this.mensaje.set(exito);
      clearTimeout(this.avisoTimer);
      if (exito) this.avisoTimer = setTimeout(() => this.mensaje.set(''), 4500);
    } catch (e) { this.error.set(this.descripcionError(e)); }
    finally { this.ocupado.set(false); }
  }

  async cargar() {
    const resultados = await Promise.allSettled([
      this.soap.obtenerCategorias(),
      this.soap.obtenerProductos(),
      this.rest.obtenerMovimientos(this.filtroMovimiento)
    ]);
    if (resultados[0].status === 'fulfilled') this.categorias.set(resultados[0].value);
    if (resultados[1].status === 'fulfilled') this.productos.set(resultados[1].value);
    if (resultados[2].status === 'fulfilled') this.movimientos.set(resultados[2].value);
    const fallo = resultados.find(r => r.status === 'rejected');
    if (fallo?.status === 'rejected') throw fallo.reason;
  }

  recargar() { return this.ejecutar(() => this.cargar()); }

  ordenarPor(valor: string) {
    if (valor === 'nombre' || valor === 'precio' || valor === 'stock') this.orden.set(valor);
  }

  navegar(pagina: Pagina) {
    this.pagina.set(pagina);
    this.error.set('');
    this.mensaje.set('');
  }

  nombreCategoria(id: number) { return this.categorias().find(c => c.idCategoria === id)?.nombre || `Categoría #${id}`; }
  nombreProducto(id: number) { return this.productos().find(p => p.idProducto === id)?.nombre || `Producto #${id}`; }
  productosDe(id: number) { return this.productos().filter(p => p.idCategoria === id); }
  tono(id: number) { return ['mint', 'peach', 'rose', 'lilac', 'cream'][Math.abs(id) % 5]; }
  anchoStock(stock: number) { return Math.min(100, Math.round((Math.max(0, stock) / 40) * 100)); }

  iconoCategoria(nombre: string) {
    const n = nombre.toLowerCase();
    if (/helado|ice/.test(n)) return '🍦';
    if (/postre/.test(n)) return '🍰';
    if (/bebida/.test(n)) return '🥤';
    if (/especial/.test(n)) return '✨';
    return '🏷️';
  }

  iconoProducto(p: Producto) {
    const n = `${p.nombre} ${this.nombreCategoria(p.idCategoria)}`.toLowerCase();
    if (/chocolate|cacao/.test(n)) return '🍫';
    if (/fresa|frutill|strawberry/.test(n)) return '🍓';
    if (/vainilla/.test(n)) return '🍦';
    if (/banana|plátano|platano/.test(n)) return '🍌';
    if (/limón|limon|lima/.test(n)) return '🍋';
    if (/café|cafe|mocha/.test(n)) return '☕';
    if (/menta|mint/.test(n)) return '🌿';
    if (/coco/.test(n)) return '🥥';
    if (/mango/.test(n)) return '🥭';
    if (/bebida|limonada|jugo/.test(n)) return '🥤';
    if (/postre|torta|cake/.test(n)) return '🍰';
    return this.iconoCategoria(this.nombreCategoria(p.idCategoria)) === '🏷️' ? '🍨' : this.iconoCategoria(this.nombreCategoria(p.idCategoria));
  }

  productoVacio(): Producto { return { idProducto: 0, nombre: '', descripcion: '', precio: 1, stock: 0, idCategoria: 0, estado: true }; }
  categoriaVacia(): Categoria { return { idCategoria: 0, nombre: '', descripcion: '', estado: true }; }
  movimientoVacio(): Movimiento { return { idMovimiento: 0, idProducto: 0, tipoMovimiento: 'Entrada', cantidad: 1, fechaMovimiento: '', observacion: '' }; }

  editarProducto(p?: Producto) { this.producto = p ? { ...p } : this.productoVacio(); this.modal = 'producto'; this.error.set(''); }
  editarCategoria(c?: Categoria) { this.categoria = c ? { ...c } : this.categoriaVacia(); this.modal = 'categoria'; this.error.set(''); }
  editarMovimiento(m?: Movimiento) { this.movimiento = m ? { ...m } : this.movimientoVacio(); this.modal = 'movimiento'; this.error.set(''); }

  verProductosDe(id: number) {
    this.categoriaSeleccionada.set(id);
    this.soloBajo.set(false);
    this.navegar('productos');
  }

  filtrarBajo() {
    this.soloBajo.set(true);
    this.navegar('productos');
  }

  quitarFiltros() {
    this.categoriaSeleccionada.set(0);
    this.soloBajo.set(false);
    this.busqueda.set('');
  }

  verMovimientosDe(id: number) {
    this.filtroMovimiento = id;
    this.navegar('movimientos');
    return this.recargar();
  }

  productoSeleccionado() { return this.productos().find(p => p.idProducto === this.movimiento.idProducto); }

  stockResultante() {
    const p = this.productoSeleccionado();
    if (!p || !Number.isInteger(this.movimiento.cantidad)) return null;
    let stock = p.stock;
    if (this.movimiento.idMovimiento) {
      const original = this.movimientos().find(m => m.idMovimiento === this.movimiento.idMovimiento);
      if (original) stock -= original.tipoMovimiento === 'Entrada' ? original.cantidad : -original.cantidad;
    }
    return stock + (this.movimiento.tipoMovimiento === 'Entrada' ? this.movimiento.cantidad : -this.movimiento.cantidad);
  }

  guardarProducto() {
    return this.ejecutar(async () => {
      const p = this.producto;
      if (!p.nombre.trim() || p.idCategoria <= 0 || !Number.isInteger(p.stock) || p.stock < 0 || !Number.isFinite(p.precio) || p.precio <= 0) throw new Error('Complete nombre, categoría, precio positivo y stock entero no negativo.');
      if (p.idProducto) await this.soap.actualizarProducto(p);
      else await this.soap.agregarProducto(p);
      this.modal = ''; await this.cargar();
    }, 'Producto guardado en la base de datos.');
  }

  guardarCategoria() {
    return this.ejecutar(async () => {
      if (!this.categoria.nombre.trim()) throw new Error('El nombre de categoría es obligatorio.');
      if (this.categoria.idCategoria) await this.soap.actualizarCategoria(this.categoria);
      else await this.soap.agregarCategoria(this.categoria);
      this.modal = ''; await this.cargar();
    }, 'Categoría guardada en la base de datos.');
  }

  guardarMovimiento() {
    return this.ejecutar(async () => {
      if (!Number.isInteger(this.movimiento.cantidad) || this.movimiento.cantidad <= 0 || this.movimiento.idProducto <= 0) throw new Error('Seleccione un producto y una cantidad entera positiva.');
      if (this.movimiento.idMovimiento) await this.rest.actualizarMovimiento(this.movimiento);
      else await this.rest.agregarMovimiento(this.movimiento);
      this.modal = ''; await this.cargar();
    }, 'Movimiento guardado y stock actualizado.');
  }

  pedirConfirmacion(titulo: string, texto: string, accionTexto: string, ejecutar: () => void) {
    this.confirmacion = { titulo, texto, accionTexto, ejecutar };
  }

  confirmar() {
    const acc = this.confirmacion?.ejecutar;
    this.confirmacion = null;
    acc?.();
  }

  eliminar(tipo: 'Categoria' | 'Producto', id: number) {
    this.pedirConfirmacion('¿Desactivar este registro?', 'Se conservará el historial y las relaciones con otros datos.', 'Desactivar', () => {
      void this.ejecutar(async () => {
        if (tipo === 'Producto') await this.soap.eliminarProducto(id);
        else await this.soap.eliminarCategoria(id);
        await this.cargar();
      }, 'Registro desactivado.');
    });
  }

  eliminarMovimiento(id: number) {
    this.pedirConfirmacion('¿Eliminar este movimiento?', 'Se revertirá su efecto en el stock del producto.', 'Eliminar', () => {
      void this.ejecutar(async () => { await this.rest.eliminarMovimiento(id); await this.cargar(); }, 'Movimiento eliminado y stock recalculado.');
    });
  }

  async consultarExterna() {
    if (this.consultando()) return;
    this.consultando.set(true); this.errorExterno.set(''); this.externos.set([]); this.consultado.set(false);
    try { this.externos.set((await this.externa.obtenerCatalogo()).products); this.consultado.set(true); }
    catch (e) { this.errorExterno.set(this.descripcionError(e)); }
    finally { this.consultando.set(false); }
  }

  externosFiltrados() {
    const q = this.busquedaExterna.trim().toLowerCase();
    return this.externos().filter(p => `${p.title} ${p.brand ?? ''} ${p.description}`.toLowerCase().includes(q));
  }

  precioLocal() { return this.productos().find(p => p.idProducto === this.referenciaLocal)?.precio ?? 0; }
  diferencia(price: number) { return price - this.precioLocal(); }
  estrellas(rating?: number) {
    const n = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
}
