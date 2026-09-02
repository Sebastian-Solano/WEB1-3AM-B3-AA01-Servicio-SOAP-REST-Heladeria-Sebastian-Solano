# HeladeriaSOAPA

Sistema academico para la gestion de productos y categorias de una heladeria, desarrollado con una arquitectura cliente-servidor.

El proyecto integra:

* Backend SOAP desarrollado en ASP.NET Core y CoreWCF.
* Entity Framework Core para acceso a datos.
* SQL Server como motor de base de datos.
* Angular como aplicacion cliente.
* Postman para pruebas de los servicios SOAP.

\---

## 1\. Descripcion del proyecto

HeladeriaSOAPA permite administrar los productos disponibles en una heladeria mediante un servicio web SOAP.

El sistema permite realizar operaciones CRUD sobre productos y consultar informacion mediante filtros especificos, como categoria y rango de precios.

Flujo general:

```text
Angular / Postman
       |
       | HTTP + SOAP/XML
       v
ASP.NET Core + CoreWCF
       |
       | Entity Framework Core
       v
SQL Server
       |
       v
HeladeriaSOAPA
```

\---

## 2\. Estructura del backend

La estructura principal del proyecto backend es:

```text
HeladeriaSOAPA/
|
|-- Properties/
|   `-- launchSettings.json
|
|-- Data/
|   `-- ProductoDBContext.cs
|
|-- Models/
|   |-- Categoria.cs
|   `-- Producto.cs
|
|-- Services/
|   |-- IProductoService.cs
|   `-- ProductoService.cs
|
|-- SQL/
|   `-- Script de base de datos
|
|-- appsettings.json
|-- Program.cs
`-- HeladeriaSOAPA.csproj
```

En la raiz del repositorio tambien se pueden encontrar:

```text
Heladeria -app/
`-- Aplicacion Angular

POSTMAN/
`-- Coleccion de pruebas de Postman

SQL/
`-- Scripts SQL

HeladeriaSOAPA.slnx
README.md
```

\---

## 3\. Descripcion de archivos principales

|Archivo o carpeta|Funcion|
|-|-|
|`Data/ProductoDBContext.cs`|Configura Entity Framework Core y las entidades utilizadas por la base de datos.|
|`Models/Categoria.cs`|Representa las categorias de productos.|
|`Models/Producto.cs`|Representa los productos de la heladeria.|
|`Services/IProductoService.cs`|Define el contrato SOAP y las operaciones disponibles.|
|`Services/ProductoService.cs`|Implementa la logica de negocio de las operaciones SOAP.|
|`SQL/`|Contiene los scripts necesarios para crear y cargar la base de datos.|
|`appsettings.json`|Contiene la cadena de conexion y configuraciones generales.|
|`Program.cs`|Configura dependencias, Entity Framework Core, CoreWCF y el servicio SOAP.|
|`Properties/launchSettings.json`|Define los puertos y URLs utilizados durante la ejecucion local.|

\---

## 4\. Tecnologias utilizadas

* C#
* ASP.NET Core
* CoreWCF
* Entity Framework Core
* SQL Server
* SOAP
* XML
* WSDL
* Angular
* TypeScript
* HTML
* CSS
* Postman
* Git
* GitHub

\---

## 5\. Requisitos previos

Antes de ejecutar el sistema se recomienda tener instalado:

* Visual Studio 2022
* .NET SDK compatible con el proyecto
* SQL Server
* SQL Server Management Studio
* Node.js
* npm
* Angular CLI
* Postman
* Git

Para verificar algunas instalaciones:

```bash
dotnet --version
node --version
npm --version
ng version
git --version
```

\---

## 6\. Descargar el proyecto

Clonar el repositorio:

```bash
git clone URL\_DEL\_REPOSITORIO
```

Tambien se puede descargar desde GitHub utilizando:

```text
Code -> Download ZIP
```

Luego descomprimir el proyecto.

\---

## 7\. Crear la base de datos

Abrir SQL Server Management Studio.

Pasos:

1. Conectarse a la instancia local de SQL Server.
2. Abrir el archivo SQL incluido en la carpeta `SQL`.
3. Ejecutar el script completo.
4. Verificar que se haya creado la base de datos:

```text
HeladeriaSOAPA
```

Las tablas principales utilizadas por el sistema son:

```text
Categoria
Producto
```

Relacion principal:

```text
Categoria
    |
    | 1
    |
    `---------- N
               Producto
```

Cada producto pertenece a una categoria.

\---

## 8\. Configurar la conexion con SQL Server

Abrir:

```text
HeladeriaSOAPA/appsettings.json
```

Configuracion general recomendada:

```json
{
  "ConnectionStrings": {
    "ConexionSQL": "Server=localhost;Database=HeladeriaSOAPA;Trusted\_Connection=True;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "\*"
}
```

El valor de `Server` depende de la instalacion de SQL Server de cada equipo.

Ejemplos:

```text
localhost
```

```text
.\\SQLEXPRESS
```

```text
NOMBRE-PC
```

```text
NOMBRE-PC\\SQLEXPRESS
```

Ejemplo para SQL Server Express:

```json
{
  "ConnectionStrings": {
    "ConexionSQL": "Server=.\\\\SQLEXPRESS;Database=HeladeriaSOAPA;Trusted\_Connection=True;TrustServerCertificate=True;"
  }
}
```

`Trusted\_Connection=True` utiliza la autenticacion de Windows del equipo donde se ejecuta el sistema.

Por este motivo, el nombre del servidor puede ser diferente en cada computadora.

\---

## 9\. Ejecutar el backend SOAP

Abrir:

```text
HeladeriaSOAPA.slnx
```

desde Visual Studio.

Antes de ejecutar:

1. Verificar que SQL Server este iniciado.
2. Confirmar que exista la base de datos `HeladeriaSOAPA`.
3. Revisar la cadena de conexion en `appsettings.json`.
4. Restaurar las dependencias NuGet si Visual Studio lo solicita.

Ejecutar desde Visual Studio:

```text
Ctrl + F5
```

Tambien se puede ejecutar desde una terminal ubicada dentro del proyecto backend:

```bash
dotnet restore
dotnet run
```

\---

## 10\. Identificar la URL del servicio

Al iniciar el backend, Visual Studio o la terminal mostrara una direccion similar a:

```text
Now listening on: http://localhost:5102
```

El puerto puede ser diferente en cada equipo.

Tambien se puede revisar:

```text
Properties/launchSettings.json
```

Ejemplo:

```json
"applicationUrl": "http://localhost:5102"
```

\---

## 11\. Verificar el servicio SOAP

Con el backend en ejecucion, abrir en el navegador:

```text
http://localhost:PUERTO/ProductoService.asmx
```

Para visualizar el WSDL:

```text
http://localhost:PUERTO/ProductoService.asmx?wsdl
```

Ejemplo:

```text
http://localhost:5102/ProductoService.asmx?wsdl
```

Si se muestra un documento XML con la descripcion del servicio, el servicio SOAP se encuentra disponible.

\---

## 12\. Operaciones SOAP disponibles

El servicio incluye las siguientes operaciones:

|Operacion|Descripcion|
|-|-|
|`ObtenerCategorias()`|Obtiene todas las categorias registradas.|
|`ObtenerProductos()`|Obtiene todos los productos registrados.|
|`ObtenerProducto(int id)`|Busca un producto por su identificador.|
|`AgregarProducto(Producto producto)`|Registra un nuevo producto.|
|`ActualizarProducto(Producto producto)`|Actualiza un producto existente.|
|`EliminarProducto(int id)`|Elimina un producto segun su identificador.|
|`ObtenerProductosPorPrecio(decimal precioMinimo, decimal precioMaximo)`|Filtra productos dentro de un rango de precios.|
|`ObtenerProductosPorCategoria(int idCategoria)`|Obtiene productos pertenecientes a una categoria.|

Las operaciones se encuentran definidas en:

```text
Services/IProductoService.cs
```

La implementacion se encuentra en:

```text
Services/ProductoService.cs
```

\---

## 13\. Probar el servicio con Postman

La carpeta:

```text
POSTMAN/
```

contiene la coleccion utilizada para probar las operaciones SOAP.

Para importar la coleccion:

1. Abrir Postman.
2. Seleccionar `Import`.
3. Seleccionar el archivo `.json` incluido en la carpeta `POSTMAN`.
4. Importar la coleccion.
5. Abrir una de las solicitudes.
6. Verificar la URL del servicio.
7. Presionar `Send`.

Ejemplo:

```text
POST http://localhost:5102/ProductoService.asmx
```

Si el backend utiliza otro puerto, se debe actualizar la URL.

Ejemplo:

```text
http://localhost:5280/ProductoService.asmx
```

\---

## 14\. Encabezados SOAP

Las peticiones utilizan normalmente:

```text
Content-Type: text/xml; charset=utf-8
```

Tambien deben incluir el encabezado `SOAPAction`.

Ejemplo:

```text
SOAPAction: "http://tempuri.org/IProductoService/ObtenerProductos"
```

El valor exacto de cada operacion se puede verificar en el WSDL.

\---

## 15\. Ejemplo de solicitud SOAP

Ejemplo para obtener todos los productos:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tem="http://tempuri.org/">

    <soap:Header/>

    <soap:Body>
        <tem:ObtenerProductos/>
    </soap:Body>

</soap:Envelope>
```

Encabezados:

```text
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://tempuri.org/IProductoService/ObtenerProductos"
```

\---

## 16\. Ejecutar la aplicacion Angular

Abrir una terminal dentro de:

```text
Heladeria -app
```

Instalar las dependencias:

```bash
npm install
```

Ejecutar la aplicacion:

```bash
ng serve
```

Si el proyecto tiene configurado el script correspondiente, tambien se puede utilizar:

```bash
npm start
```

Angular normalmente se ejecuta en:

```text
http://localhost:4200
```

Abrir esa direccion en el navegador.

\---

## 17\. Orden recomendado de ejecucion

Se recomienda iniciar el sistema en el siguiente orden:

```text
1. Iniciar SQL Server
        |
        v
2. Ejecutar el script SQL
        |
        v
3. Configurar appsettings.json
        |
        v
4. Ejecutar HeladeriaSOAPA
        |
        v
5. Verificar ProductoService.asmx?wsdl
        |
        +-----------------> Probar con Postman
        |
        v
6. Ejecutar la aplicacion Angular
```

\---

## 18\. Solucion de problemas

### Error de conexion con SQL Server

Verificar:

* SQL Server esta iniciado.
* La base de datos `HeladeriaSOAPA` existe.
* El valor `Server` de `appsettings.json` es correcto.
* La instancia de SQL Server coincide con la instalada en el equipo.

Si:

```text
Server=localhost
```

no funciona, probar:

```text
Server=.\\SQLEXPRESS
```

o utilizar el nombre de servidor que aparece al conectarse desde SQL Server Management Studio.

\---

### Postman no conecta con localhost

El `localhost` utilizado en Postman corresponde al backend ASP.NET, no directamente a SQL Server.

Primero ejecutar el backend y comprobar una linea similar a:

```text
Now listening on: http://localhost:5102
```

Despues utilizar exactamente esa direccion y puerto en Postman:

```text
http://localhost:5102/ProductoService.asmx
```

\---

### El WSDL no abre

Comprobar:

1. El backend esta ejecutandose.
2. El puerto es correcto.
3. CoreWCF esta configurado en `Program.cs`.
4. La ruta del servicio es `/ProductoService.asmx`.

URL de prueba:

```text
http://localhost:PUERTO/ProductoService.asmx?wsdl
```

\---

### Angular no inicia

Ejecutar primero:

```bash
npm install
```

Verificar:

```bash
node --version
npm --version
ng version
```

Luego ejecutar:

```bash
ng serve
```

\---

### Angular inicia pero no obtiene informacion

Verificar:

* El backend SOAP esta ejecutandose.
* La URL utilizada por Angular es correcta.
* El puerto coincide con el backend.
* SQL Server esta iniciado.
* La base de datos contiene registros.
* La configuracion CORS permite las solicitudes necesarias.

\---

\---

## 19\. Autor

Sebastian Solano

