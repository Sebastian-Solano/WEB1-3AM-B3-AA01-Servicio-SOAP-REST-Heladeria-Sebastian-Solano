# Matriz de requisitos del PDF

Se aplica exclusivamente el tema de **Tercero A Matutino**, coherente con el proyecto previo y el diagrama entregado. Las reglas administrativas del documento se documentan para la entrega, sin efectuar publicaciones ni envíos a terceros.

| Requisito | Implementación / evidencia |
|---|---|
| Ampliar el trabajo previo | Servicio y entidades SOAP originales; frontend Angular conservado y conectado |
| Navegación clara | Productos, Categorías, Movimientos, Catálogo externo |
| Gestionar categorías | CRUD lógico SOAP y formulario Angular |
| Gestionar productos y relación | CRUD lógico SOAP, selector y nombre de categoría |
| Movimiento asociado al producto | Modelo con FK, REST CRUD y selector/filtro Angular |
| Registrar, actualizar, consultar y eliminar | Formularios, listados y acciones por entidad; eliminación lógica donde corresponde |
| Validación y mensajes | Formularios y validación servidor; SOAP Fault y errores REST comprensibles |
| URLs y CORS | api.config.ts y políticas en ambos servicios |
| API externa desde Angular | HttpClient directo a DummyJSON en Catálogo externo |
| Información relacionada con el tema | Catálogo de alimentos e insumos; comparación con precio de producto local |
| Éxito, vacío y error externo | Estado de carga, tarjetas, lista vacía y reintento; prueba de error de red |
| Base y persistencia | SQL Server compartido, transacciones y VerificarPersistencia.sql |
| Código ejecutable | Dos proyectos .NET en solución y proyecto Angular |
| README | Requisitos, ejecución, endpoints, arquitectura y API externa |
| Scripts SQL | Instalación idempotente, claves y datos mínimos sin borrar datos anteriores |
| Colección de pruebas | POSTMAN/Heladeria-AA.postman_collection.json, con IDs automáticos |
| Explicación del flujo | README y docs/GUION_VIDEO.md |
| Evidencias | Capturas, solicitudes HTTP registradas, prueba de integración y video subtitulado |
| Enlace GitHub | Pendiente de publicación por el propietario; código preparado localmente |
| Video y entrega | Demostración local incluida; revisar explicación personal y compartir enlace |

Ver `evidencias/VERIFICACION.md` para el alcance real de las pruebas realizadas. No se afirma que se haya publicado el repositorio ni enviado la tarea.
