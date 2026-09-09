# Heladería SOAPA · Actividad Autónoma

**Programación Web I · Tercero A Matutino · Septiembre 2026**  
Tema: **Categoría + Producto (SOAP), MovimientoInventario (REST) y catálogo externo desde Angular**.  
Proyecto original: Sebastián Solano.

Aplicación para administrar una heladería con datos persistidos en SQL Server. Se amplió el servicio SOAP previo y se conectó el frontend Angular existente. El servicio REST se ejecuta como un proyecto independiente y comparte el modelo de datos con SOAP.

## Arquitectura y entidades

```text
Angular :4200
  ├─ SOAP/XML → HeladeriaSOAPA :5102 → Entity Framework → SQL Server
  ├─ REST/JSON → HeladeriaREST :5103 → Entity Framework → misma base
  └─ HTTPS/JSON → DummyJSON (consulta directa desde el navegador)

Categoria (1) ── (N) Producto (1) ── (N) MovimientoInventario
```

- **Categoria:** IdCategoria, Nombre, Descripcion, Estado.
- **Producto:** IdProducto, Nombre, Descripcion, Precio, Stock, Estado, IdCategoria (FK).
- **MovimientoInventario:** IdMovimiento, IdProducto (FK), TipoMovimiento, Cantidad, FechaMovimiento y Observacion.

La pantalla de productos muestra la categoría correspondiente. Movimientos permite seleccionar el producto y consultar su stock. Las categorías y productos se desactivan mediante eliminación lógica para conservar las relaciones e historial; se pueden reactivar al editarlos.

## Estructura

| Carpeta | Contenido |
|---|---|
| `HeladeriaSOAPA/` | Servicio SOAP original ampliado; entidades y DbContext compartidos |
| `HeladeriaREST/` | API REST de movimientos, ejecutable independiente |
| `Heladeria -app/` | Frontend Angular (`config`, `features`, `Model`, `services`) |
| `SQL/HeladeriaSOAPA.sql` | Instalación o ampliación sin borrar registros existentes |
| `SQL/VerificarPersistencia.sql` | Consultas para demostrar persistencia |
| `POSTMAN/Heladeria-SOAP.postman_collection.json` | Operaciones SOAP de categoría y producto |
| `POSTMAN/Heladeria-REST.postman_collection.json` | CRUD REST de movimientos de inventario |
| `POSTMAN/Heladeria-AA.postman_collection.json` | Pruebas encadenadas SOAP + REST + API externa |
| `scripts/` | Pruebas de integración y generador de la colección |
| `evidencias/` | Capturas, resultado de pruebas y demostración grabada |
| `docs/` | Guion de explicación y matriz de requisitos |

Los archivos originales `POSTMAN/HeladeriaSOAPA.postman_collection.json`, `HeladeriaSOAPA/SQL/SQLQuery1.sql` y `Recursos 4/` se conservan como antecedentes. Para esta entrega use los archivos indicados en la tabla.

## Requisitos

- .NET SDK **10** (se verificó con 10.0.400).
- SQL Server local y autenticación de Windows; SSMS o `sqlcmd` para ejecutar los scripts.
- Node.js y npm compatibles con Angular 22 (se verificó con Node 26).
- Internet para restaurar paquetes y consultar la API externa.
- Opcional: Postman y Git.

Tecnologías: C#, ASP.NET Core, CoreWCF, Entity Framework Core SQL Server, SQL Server, Angular 22, TypeScript, HttpClient, formularios Angular y DummyJSON. Las versiones exactas están en los `.csproj`, `package.json` y `package-lock.json`.

## 1. Crear o ampliar la base de datos

Abra `SQL/HeladeriaSOAPA.sql` en SSMS y ejecútelo en su instancia. O, desde la raíz del repositorio:

```powershell
sqlcmd -S localhost -E -C -i SQL/HeladeriaSOAPA.sql -b
```

El script crea la base `HeladeriaSOAPA` si no existe, las tres tablas, las relaciones y datos iniciales únicamente cuando las tablas están vacías. Puede ejecutarse de nuevo: no elimina tablas ni reemplaza los datos anteriores. Si la base previa ya contiene categorías y productos, agrega la tabla de movimientos.

Configure **la misma base** en `HeladeriaSOAPA/appsettings.json` y `HeladeriaREST/appsettings.json`. Ejemplo sin contraseñas:

```json
{
  "ConnectionStrings": {
    "ConexionSQL": "Server=localhost;Database=HeladeriaSOAPA;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

En SQL Express el servidor puede ser `.\\SQLEXPRESS` dentro del JSON. También puede sobrescribir la conexión mediante la variable de entorno `ConnectionStrings__ConexionSQL` antes de iniciar cada servicio. No publique credenciales reales. La configuración local previa del proyecto SOAP se conservó.

## 2. Ejecutar SOAP

Desde la raíz, primera terminal:

```powershell
dotnet restore HeladeriaSOAPA.slnx
dotnet run --project HeladeriaSOAPA --launch-profile http
```

- Endpoint: `http://localhost:5102/ProductoService.asmx`
- WSDL: `http://localhost:5102/ProductoService.asmx?wsdl`
- Protocolo: SOAP 1.1, `Content-Type: text/xml; charset=utf-8`.
- SOAPAction: `"http://tempuri.org/IProductoService/NOMBRE_OPERACION"`.

| Acción | Uso |
|---|---|
| ObtenerCategorias | Listar categorías activas e inactivas |
| AgregarCategoria / ActualizarCategoria | Registrar y editar categorías |
| EliminarCategoria | Desactivar; rechaza categorías con productos activos |
| ObtenerProductos / ObtenerProducto | Listado y consulta por ID, incluyendo inactivos |
| AgregarProducto / ActualizarProducto | Registrar y editar productos |
| EliminarProducto | Desactivar conservando historial |
| ObtenerProductosPorCategoria | Filtrar productos activos por categoría |
| ObtenerProductosPorPrecio | Filtrar productos activos por rango de precios |

Ejemplo de cuerpo XML para consulta:

```xml
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <ObtenerProductos xmlns="http://tempuri.org/" />
  </s:Body>
</s:Envelope>
```

Los objetos de entrada usan el namespace `http://schemas.datacontract.org/2004/07/HeladeriaSOAPA.Models`. Sus miembros deben viajar en orden alfabético, como exige el DataContractSerializer utilizado. El cliente Angular realiza esta serialización y escapa los caracteres XML.

## 3. Ejecutar REST

Segunda terminal, desde la raíz:

```powershell
dotnet run --project HeladeriaREST --launch-profile http
```

Base: `http://localhost:5103/api/movimientos`.

| Método y ruta | Resultado |
|---|---|
| GET /api/movimientos | Listado, ordenado por fecha descendente |
| GET /api/movimientos?idProducto=1 | Movimientos del producto |
| GET /api/movimientos/1 | Consulta individual; 404 si no existe |
| POST /api/movimientos | Crea movimiento y aplica stock; 201 |
| PUT /api/movimientos/1 | Corrige tipo, cantidad u observación y ajusta stock; 200 |
| DELETE /api/movimientos/1 | Elimina el movimiento y revierte su efecto; 204 |

Ejemplo de cuerpo POST/PUT (`Content-Type: application/json`):

```json
{
  "idProducto": 1,
  "tipoMovimiento": "Entrada",
  "cantidad": 5,
  "observacion": "Ingreso de producción"
}
```

**Reglas de inventario:**

- Entrada suma; Salida resta. Cantidad debe ser un entero positivo, el producto debe existir y estar activo, y observación admite 250 caracteres.
- La fecha se genera en UTC en el servidor y Angular la presenta en hora local. Al editar se conserva la fecha original.
- Una transacción con aislamiento Serializable guarda el movimiento y el stock de forma conjunta. Si falta stock o hay un conflicto, no se guarda parcialmente.
- Editar revierte el efecto anterior y aplica el nuevo. El producto de un movimiento existente no se puede cambiar.
- Eliminar revierte el efecto; se rechaza si la reversión dejaría stock negativo.
- Stock inicial es el saldo de apertura. Después, se ajusta mediante movimientos REST. SOAP rechaza intentos de cambiarlo al editar un producto, incluido un valor desactualizado.
- Respuestas de error: 400 datos inválidos, 404 registro inexistente, 409 stock insuficiente o conflicto de persistencia. Tras un conflicto, recargue los datos antes de reintentar.

## 4. Ejecutar Angular

Tercera terminal:

```powershell
cd "Heladeria -app"
npm ci
npm start
```

Abra **http://localhost:4200**. La navegación incluye Productos, Categorías, Movimientos y Catálogo externo. Se muestran estados de carga, mensajes de éxito/error y formularios validados.

Las URLs están centralizadas en `Heladeria -app/src/app/config/api.config.ts`. Ambos servicios permiten CORS desde `http://localhost:4200` y `http://127.0.0.1:4200`, incluidos SOAPAction y Content-Type. Si cambia puertos u orígenes, actualice el archivo y las políticas CORS de ambos `Program.cs`.

## API externa

Se utiliza **DummyJSON**, endpoint público [catálogo de alimentos](https://dummyjson.com/products/category/groceries), documentado en [Products](https://dummyjson.com/docs/products). No requiere clave.

La pantalla **Catálogo externo** hace una consulta HTTP directa desde Angular al pulsar **Consultar catálogo**. Presenta los campos recibidos `title`, `category`, `price`, `thumbnail` y `description`. Permite filtrar los resultados y seleccionar un producto local para ver su precio y la diferencia con cada referencia externa. Los alimentos sirven como referencias de ingredientes y complementos para la heladería.

DummyJSON contiene datos de demostración, no cotizaciones comerciales. Son respuestas reales del servicio público; no datos codificados en Angular. La comparación académica muestra los precios como USD y no representa equivalencia de peso, tamaño o presentación. La API externa no reemplaza ni modifica la base local. Se maneja carga, resultado vacío, fallo de conexión y reintento; no se inventan resultados cuando falla.

## Pruebas y evidencias

Compilar y ejecutar pruebas de Angular:

```powershell
dotnet build HeladeriaSOAPA.slnx
cd "Heladeria -app"
npm run build
npm test -- --watch=false
```

Con ambos servicios activos, desde la raíz:

```powershell
./scripts/Probar-Integracion.ps1
```

El script crea sus propios registros QA, comprueba CRUD SOAP, movimientos REST, stock, errores y reversión. Termina desactivando sus registros y conserva la trazabilidad; no modifica los productos originales. No lo ejecute contra una base de producción.

En Postman, importe:

- **POSTMAN/Heladeria-SOAP.postman_collection.json** — Categoría y producto (`:5102`).
- **POSTMAN/Heladeria-REST.postman_collection.json** — Movimientos (`:5103`).
- **POSTMAN/Heladeria-AA.postman_collection.json** — Recorrido encadenado SOAP + REST + DummyJSON (Collection Runner).

Las variables `soapUrl`, `restUrl`, `categoriaId`, `productoId` y `movimientoId` permiten cambiar puertos e IDs.

Para comprobar directamente SQL Server:

```powershell
sqlcmd -S localhost -E -C -i SQL/VerificarPersistencia.sql
```

Las capturas y la demostración en `evidencias/` proceden de la aplicación conectada a servicios reales. `scripts/probar-navegador.cjs` documenta la prueba de navegador; requiere Playwright, Chrome y el grabador FFmpeg de Playwright. La prueba crea un producto de demostración y lo conserva para poder verificarlo en SQL. Se simula únicamente una solicitud externa fallida para comprobar el tratamiento de errores, después de una consulta externa real exitosa.

## Entrega académica

- Código, SQL, configuración, README y colección Postman: incluidos en esta carpeta.
- Guion de explicación de menos de cinco minutos: `docs/GUION_VIDEO.md`.
- Matriz que relaciona cada requisito con su implementación: `docs/REQUISITOS.md`.
- Video de demostración con subtítulos: `evidencias/Demostracion-AA.webm`. Revíselo y añada su explicación personal si el docente exige narración; debe poder justificar el código.
- Publicación: suba esta carpeta a su repositorio GitHub y entregue su enlace. Revise el acceso al repositorio y al video. La publicación y el envío al docente son pasos externos pendientes; no se han realizado automáticamente.

`.gitignore` excluye `bin`, `obj`, `node_modules`, `.angular`, `dist`, temporales y archivos de secretos. Los proyectos no incluyen autenticación: el alcance es la demostración académica local.
