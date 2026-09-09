/** Feature Movimientos: endpoints REST de HeladeriaREST. */
export const ENDPOINTS_REST_MOVIMIENTOS = {
  listar: 'GET /api/movimientos',
  consultar: 'GET /api/movimientos/{id}',
  filtrar: 'GET /api/movimientos?idProducto=',
  registrar: 'POST /api/movimientos',
  actualizar: 'PUT /api/movimientos/{id}',
  eliminar: 'DELETE /api/movimientos/{id}'
} as const;

export { MovimientoRestService } from '../../services/movimiento-rest.service';
export type { Movimiento } from '../../Model/movimiento';
