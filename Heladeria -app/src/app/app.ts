import { CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  idCategoria: number;
  icono: string;
  color: string;
}

@Component({ selector: 'app-root', imports: [CurrencyPipe, FormsModule], templateUrl: './app.html', styleUrls: ['./app.scss', './interactions.scss'] })
export class App {
  protected readonly categorias = [
    { id: 1, nombre: 'Helados' }, { id: 2, nombre: 'Paletas' }, { id: 3, nombre: 'Postres' }
  ];
  protected readonly productos = signal<Producto[]>([
    { idProducto: 1, nombre: 'Vainilla Andina', descripcion: 'Cremoso helado artesanal de vainilla.', precio: 2.75, stock: 24, idCategoria: 1, icono: '🍨', color: '#fff0c9' },
    { idProducto: 2, nombre: 'Chocolate Intenso', descripcion: 'Cacao ecuatoriano al 70%.', precio: 3.25, stock: 12, idCategoria: 1, icono: '🍫', color: '#ead4c2' },
    { idProducto: 3, nombre: 'Paleta de Fresa', descripcion: 'Fresas naturales y un toque de limón.', precio: 1.75, stock: 8, idCategoria: 2, icono: '🍓', color: '#ffdce1' },
    { idProducto: 4, nombre: 'Copa Tropical', descripcion: 'Mango, coco y fruta fresca.', precio: 4.50, stock: 16, idCategoria: 3, icono: '🥭', color: '#ffe4aa' },
  ]);
  protected readonly busqueda = signal('');
  protected readonly categoriaSeleccionada = signal(0);
  protected mostrarFormulario = false;
  protected nuevoProducto = this.formularioVacio();

  protected readonly productosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const categoria = this.categoriaSeleccionada();
    return this.productos().filter(p =>
      (!texto || p.nombre.toLowerCase().includes(texto) || p.descripcion.toLowerCase().includes(texto)) &&
      (!categoria || p.idCategoria === categoria)
    );
  });
  protected readonly totalStock = computed(() => this.productos().reduce((total, p) => total + p.stock, 0));
  protected readonly valorInventario = computed(() => this.productos().reduce((total, p) => total + p.precio * p.stock, 0));
  protected readonly stockBajo = computed(() => this.productos().filter(p => p.stock <= 10).length);

  protected nombreCategoria(id: number) { return this.categorias.find(c => c.id === id)?.nombre ?? 'Sin categoría'; }
  protected guardarProducto() {
    if (!this.nuevoProducto.nombre.trim() || this.nuevoProducto.precio <= 0 || this.nuevoProducto.stock < 0) return;
    const colores = ['#dff4eb', '#e5ddff', '#ffe4aa', '#ffdce1'];
    this.productos.update(items => [...items, {
      ...this.nuevoProducto, nombre: this.nuevoProducto.nombre.trim(),
      idProducto: Math.max(0, ...items.map(p => p.idProducto)) + 1,
      icono: '🍦', color: colores[items.length % colores.length]
    }]);
    this.nuevoProducto = this.formularioVacio();
    this.mostrarFormulario = false;
  }
  protected eliminarProducto(id: number) { this.productos.update(items => items.filter(p => p.idProducto !== id)); }
  protected ajustarStock(id: number, cambio: number) {
    this.productos.update(items => items.map(p => p.idProducto === id ? { ...p, stock: Math.max(0, p.stock + cambio) } : p));
  }
  protected limpiarFiltros() {
    this.busqueda.set('');
    this.categoriaSeleccionada.set(0);
  }
  private formularioVacio() { return { nombre: '', descripcion: '', precio: 0, stock: 0, idCategoria: 1 }; }
}
