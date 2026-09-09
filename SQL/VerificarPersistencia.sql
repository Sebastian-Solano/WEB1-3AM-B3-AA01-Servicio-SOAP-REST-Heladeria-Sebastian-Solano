-- Comprobación de persistencia para la demostración. Ejecutar después de usar Angular.
USE HeladeriaSOAPA;
GO
SELECT c.IdCategoria,c.Nombre,c.Estado FROM dbo.Categoria c ORDER BY c.IdCategoria;
SELECT p.IdProducto,p.Nombre,c.Nombre AS Categoria,p.Precio,p.Stock,p.Estado
FROM dbo.Producto p JOIN dbo.Categoria c ON c.IdCategoria=p.IdCategoria ORDER BY p.IdProducto;
SELECT m.IdMovimiento,p.Nombre AS Producto,m.TipoMovimiento,m.Cantidad,m.FechaMovimiento,m.Observacion
FROM dbo.MovimientoInventario m JOIN dbo.Producto p ON p.IdProducto=m.IdProducto
ORDER BY m.IdMovimiento DESC;
