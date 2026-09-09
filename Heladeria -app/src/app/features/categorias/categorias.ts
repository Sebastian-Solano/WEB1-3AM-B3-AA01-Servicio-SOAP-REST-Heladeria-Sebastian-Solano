/** Feature Categorías: altas y bajas SOAP ligadas a los productos. */
export const OPERACIONES_SOAP_CATEGORIAS = [
  'ObtenerCategorias',
  'AgregarCategoria',
  'ActualizarCategoria',
  'EliminarCategoria'
] as const;

export { ProductoSoapService } from '../../services/producto-soap.service';
export type { Categoria } from '../../Model/categoria';
