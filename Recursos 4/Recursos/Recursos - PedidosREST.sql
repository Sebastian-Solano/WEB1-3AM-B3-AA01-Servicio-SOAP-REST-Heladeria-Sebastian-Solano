/*
    PRACTICA PROGRAMACION WEB I - SERVICIO REST
    -------------------------------------------
    Este script AGREGA la tabla Pedidos a la misma base de datos
    que ya utiliza el servicio SOAP de Clientes.

    Si tu base SOAP tiene otro nombre, cambia ClientesSOAP en la linea USE.
*/

USE [ClientesSOAPDB];
GO

IF OBJECT_ID(N'dbo.Clientes', N'U') IS NULL
BEGIN
    THROW 50001, 'No existe dbo.Clientes. Ejecute este script sobre la base de datos utilizada por el servicio SOAP.', 1;
END;
GO

IF OBJECT_ID(N'dbo.Pedidos', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Pedidos;
END;
GO

CREATE TABLE dbo.Pedidos
(
    IdPedido INT IDENTITY(1,1) NOT NULL,
    IdCliente INT NOT NULL,
    FechaPedido DATETIME2(0) NOT NULL,
    Descripcion VARCHAR(200) NOT NULL,
    Cantidad INT NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    Estado VARCHAR(30) NOT NULL,

    CONSTRAINT PK_Pedidos PRIMARY KEY (IdPedido),
    CONSTRAINT FK_Pedidos_Clientes
        FOREIGN KEY (IdCliente)
        REFERENCES dbo.Clientes(IdCliente),
    CONSTRAINT CK_Pedidos_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT CK_Pedidos_Total CHECK (Total >= 0)
);
GO

/*
   Tomamos hasta tres IdCliente que YA EXISTAN.
   De esta forma los INSERT respetan la FOREIGN KEY.
*/
DECLARE @Cliente1 INT;
DECLARE @Cliente2 INT;
DECLARE @Cliente3 INT;

SELECT @Cliente1 = MIN(IdCliente)
FROM dbo.Clientes;

IF @Cliente1 IS NULL
BEGIN
    THROW 50002, 'La tabla Clientes no tiene registros. Primero registre clientes con el servicio SOAP.', 1;
END;

SELECT @Cliente2 = MIN(IdCliente)
FROM dbo.Clientes
WHERE IdCliente > @Cliente1;

SET @Cliente2 = ISNULL(@Cliente2, @Cliente1);

SELECT @Cliente3 = MIN(IdCliente)
FROM dbo.Clientes
WHERE IdCliente > @Cliente2;

SET @Cliente3 = ISNULL(@Cliente3, @Cliente1);

INSERT INTO dbo.Pedidos
    (IdCliente, FechaPedido, Descripcion, Cantidad, Total, Estado)
VALUES
    (@Cliente1, '2026-08-24T09:00:00', 'Teclado mecanico',       1,  45.00, 'Pendiente'),
    (@Cliente2, '2026-08-24T10:30:00', 'Mouse inalambrico',     2,  36.00, 'Entregado'),
    (@Cliente3, '2026-08-25T11:00:00', 'Monitor 24 pulgadas',   1, 175.00, 'Procesando'),
    (@Cliente1, '2026-08-25T14:15:00', 'Audifonos USB',         1,  28.50, 'Pendiente');
GO

SELECT
    p.IdPedido,
    p.IdCliente,
    c.Nombre,
    c.Apellido,
    p.FechaPedido,
    p.Descripcion,
    p.Cantidad,
    p.Total,
    p.Estado
FROM dbo.Pedidos p
INNER JOIN dbo.Clientes c
    ON c.IdCliente = p.IdCliente
ORDER BY p.IdPedido;
GO
