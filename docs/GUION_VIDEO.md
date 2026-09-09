# Guion de demostración · duración objetivo 4:30

Este guion acompaña la grabación con subtítulos. Preséntalo con tus palabras y comprueba que entiendes cada paso. No es necesario memorizar código.

| Tiempo | Mostrar y explicar |
|---|---|
| 0:00–0:30 | Presentar Heladería SOAPA, Tercero A Matutino. Mostrar carpetas SOAP, REST, Angular y SQL. SOAP conserva el trabajo previo; REST añade inventario. |
| 0:30–1:20 | Abrir Angular, consultar categorías y crear una categoría. Crear un producto relacionado, precio 4,50 y stock 10. Explicar sobre SOAP/XML, SOAPAction e IdCategoria. |
| 1:20–1:50 | Editar precio a 4,75. Explicar validaciones y por qué el stock se modifica mediante movimientos. Mostrar mensaje de guardado. |
| 1:50–2:40 | Crear Entrada de 5 unidades por REST. Mostrar stock 15 y movimiento asociado. Intentar Salida de 100: HTTP 409, stock intacto. Explicar JSON y transacción. |
| 2:40–3:20 | Consultar catálogo externo desde Angular. Seleccionar producto local, mostrar precio, imagen y diferencia. Aclarar que DummyJSON es un catálogo de demostración consultado realmente. |
| 3:20–3:55 | Recargar Angular y mostrar que producto y stock se conservan. Ejecutar SQL/VerificarPersistencia.sql en SSMS para mostrar las tres tablas. |
| 3:55–4:30 | Mostrar servicios.ts, ProductoService.cs y HeladeriaREST/Program.cs. Explicar el flujo, el tratamiento de errores y cerrar con README y Postman. |

## Preguntas que debes poder responder

- ¿Qué acción usa SOAP? Categorías y productos, mediante XML y SOAPAction.
- ¿Qué acción usa REST? Listar/crear/editar/eliminar movimientos mediante GET/POST/PUT/DELETE y JSON.
- ¿Dónde se guarda el stock? Producto.Stock en SQL Server, en la misma transacción que el movimiento.
- ¿Cómo se evita una salida excesiva? Se calcula el saldo resultante dentro de la transacción y se rechaza un valor negativo.
- ¿Cómo se corrige un movimiento? Se revierte su efecto anterior y se aplica el nuevo; no se permite cambiar su producto.
- ¿Qué consulta realiza Angular a internet? GET a DummyJSON, categoría groceries; muestra la respuesta y la compara con un producto local.
- ¿La API externa modifica productos locales? No; es una referencia de consulta.
- ¿Por qué no se borran categorías/productos físicamente? Para conservar relaciones y movimientos históricos.

## Antes de entregar

Comprueba duración menor a cinco minutos, legibilidad, accesibilidad del enlace de GitHub y acceso al video. La grabación generada tiene subtítulos explicativos; puedes usarla como base y añadir tu narración. No publiques contraseñas ni archivos de dependencias.
