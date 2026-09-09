/** Feature Productos: operaciones SOAP de la colección Postman. */
export const OPERACIONES_SOAP_PRODUCTOS = [
  'ObtenerCategorias',
  'ObtenerProductos',
  'ObtenerProducto',
  'AgregarProducto',
  'ActualizarProducto',
  'EliminarProducto',
  'ObtenerProductosPorPrecio',
  'ObtenerProductosPorCategoria'
] as const;

export { ProductoSoapService } from '../../services/producto-soap.service';
export type { Producto } from '../../Model/producto';
