import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { API } from '../config/api.config';
import { Categoria } from '../Model/categoria';
import { Producto } from '../Model/producto';
import { leerSoap, objetosSoap, serializarContrato } from './soap.util';

/** Cliente Angular de las operaciones SOAP de la colección Postman (InventarioSOAP). */
@Injectable({ providedIn: 'root' })
export class ProductoSoapService {
  private http = inject(HttpClient);

  private async llamar(operacion: string, contenido = ''): Promise<Document> {
    const body = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><${operacion} xmlns="http://tempuri.org/">${contenido}</${operacion}></s:Body></s:Envelope>`;
    try {
      const xml = await firstValueFrom(this.http.post(API.soap, body, {
        responseType: 'text',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: `"http://tempuri.org/IProductoService/${operacion}"`
        }
      }).pipe(timeout(15000)));
      const doc = leerSoap(xml);
      if (doc.getElementsByTagNameNS('*', `${operacion}Result`)[0]?.textContent === 'false') {
        throw new Error('El registro ya no existe. Recargue la lista.');
      }
      return doc;
    } catch (error) {
      if (error instanceof HttpErrorResponse && typeof error.error === 'string' && error.error.includes('Fault')) leerSoap(error.error);
      throw error;
    }
  }

  private productoXml(producto: Producto): string {
    return `<producto xmlns:d="http://schemas.datacontract.org/2004/07/HeladeriaSOAPA.Models">${serializarContrato(producto)}</producto>`;
  }

  private categoriaXml(categoria: Categoria): string {
    return `<categoria xmlns:d="http://schemas.datacontract.org/2004/07/HeladeriaSOAPA.Models">${serializarContrato(categoria)}</categoria>`;
  }

  obtenerCategorias() {
    return this.llamar('ObtenerCategorias').then(doc => objetosSoap<Categoria>(doc, 'Categoria'));
  }

  obtenerProductos() {
    return this.llamar('ObtenerProductos').then(doc => objetosSoap<Producto>(doc, 'Producto'));
  }

  obtenerProducto(id: number) {
    return this.llamar('ObtenerProducto', `<id>${id}</id>`).then(doc => objetosSoap<Producto>(doc, 'Producto')[0] ?? null);
  }

  agregarProducto(producto: Producto) {
    return this.llamar('AgregarProducto', this.productoXml(producto));
  }

  actualizarProducto(producto: Producto) {
    return this.llamar('ActualizarProducto', this.productoXml(producto));
  }

  eliminarProducto(id: number) {
    return this.llamar('EliminarProducto', `<id>${id}</id>`);
  }

  obtenerProductosPorPrecio(precioMinimo: number, precioMaximo: number) {
    return this.llamar('ObtenerProductosPorPrecio', `<precioMinimo>${precioMinimo}</precioMinimo><precioMaximo>${precioMaximo}</precioMaximo>`)
      .then(doc => objetosSoap<Producto>(doc, 'Producto'));
  }

  obtenerProductosPorCategoria(idCategoria: number) {
    return this.llamar('ObtenerProductosPorCategoria', `<idCategoria>${idCategoria}</idCategoria>`)
      .then(doc => objetosSoap<Producto>(doc, 'Producto'));
  }

  agregarCategoria(categoria: Categoria) {
    return this.llamar('AgregarCategoria', this.categoriaXml(categoria));
  }

  actualizarCategoria(categoria: Categoria) {
    return this.llamar('ActualizarCategoria', this.categoriaXml(categoria));
  }

  eliminarCategoria(id: number) {
    return this.llamar('EliminarCategoria', `<id>${id}</id>`);
  }
}
