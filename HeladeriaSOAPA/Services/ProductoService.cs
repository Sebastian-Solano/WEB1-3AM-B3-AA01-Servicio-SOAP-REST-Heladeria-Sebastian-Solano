using CoreWCF;
using HeladeriaSOAPA.Data;
using HeladeriaSOAPA.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace HeladeriaSOAPA.Services;

public class ProductoService(ProductosDBContext context) : IProductoService
{
    public List<Categoria> ObtenerCategorias() => context.Categorias.AsNoTracking().OrderBy(c => c.Nombre).ToList();
    public List<Producto> ObtenerProductos() => context.Productos.AsNoTracking().OrderBy(p => p.Nombre).ToList();
    public Producto? ObtenerProducto(int id) => context.Productos.AsNoTracking().FirstOrDefault(p => p.IdProducto == id);

    private static void Validar(object entity, string nombre)
    {
        var errores = new List<ValidationResult>();
        if (!Validator.TryValidateObject(entity, new ValidationContext(entity), errores, true))
            throw new FaultException(string.Join(" ", errores.Select(e => e.ErrorMessage)));
        if (string.IsNullOrWhiteSpace(nombre)) throw new FaultException("El nombre es obligatorio.");
    }
    private T Guardar<T>(Func<T> accion)
    {
        using var tx = context.Database.BeginTransaction(IsolationLevel.Serializable);
        var resultado = accion();
        context.SaveChanges();
        tx.Commit();
        return resultado;
    }
    public Categoria AgregarCategoria(Categoria categoria) => Guardar(() =>
    {
        Validar(categoria, categoria.Nombre);
        categoria.IdCategoria = 0;
        categoria.Nombre = categoria.Nombre.Trim();
        context.Categorias.Add(categoria);
        return categoria;
    });
    public bool ActualizarCategoria(Categoria categoria) => Guardar(() =>
    {
        Validar(categoria, categoria.Nombre);
        var actual = context.Categorias.Find(categoria.IdCategoria);
        if (actual == null) return false;
        if (!categoria.Estado && context.Productos.Any(p => p.IdCategoria == actual.IdCategoria && p.Estado))
            throw new FaultException("No se puede desactivar una categoría con productos activos.");
        actual.Nombre = categoria.Nombre.Trim();
        actual.Descripcion = categoria.Descripcion;
        actual.Estado = categoria.Estado;
        return true;
    });
    public bool EliminarCategoria(int id) => Guardar(() =>
    {
        var categoria = context.Categorias.Find(id);
        if (categoria == null) return false;
        if (context.Productos.Any(p => p.IdCategoria == id && p.Estado))
            throw new FaultException("Primero desactive o cambie de categoría los productos activos.");
        categoria.Estado = false;
        return true;
    });
    private void ValidarProducto(Producto producto)
    {
        Validar(producto, producto.Nombre);
        if (producto.Precio <= 0 || producto.Precio > 99999999.99m || decimal.Round(producto.Precio, 2) != producto.Precio)
            throw new FaultException("El precio debe ser positivo, con un máximo de dos decimales.");
        if (producto.Stock < 0) throw new FaultException("El stock no puede ser negativo.");
        if (!context.Categorias.Any(c => c.IdCategoria == producto.IdCategoria && (c.Estado || !producto.Estado)))
            throw new FaultException("Seleccione una categoría activa para el producto.");
    }
    public Producto AgregarProducto(Producto producto) => Guardar(() =>
    {
        ValidarProducto(producto);
        producto.IdProducto = 0;
        producto.Nombre = producto.Nombre.Trim();
        context.Productos.Add(producto);
        return producto;
    });
    public bool ActualizarProducto(Producto producto) => Guardar(() =>
    {
        ValidarProducto(producto);
        var actual = context.Productos.Find(producto.IdProducto);
        if (actual == null) return false;
        if (producto.Stock != actual.Stock)
            throw new FaultException("El stock cambió o se intentó editar directamente. Recargue y use Movimientos para ajustar existencias.");
        actual.Nombre = producto.Nombre.Trim();
        actual.Descripcion = producto.Descripcion;
        actual.Precio = producto.Precio;
        actual.Estado = producto.Estado;
        actual.IdCategoria = producto.IdCategoria;
        return true;
    });
    public bool EliminarProducto(int id) => Guardar(() =>
    {
        var producto = context.Productos.Find(id);
        if (producto == null) return false;
        producto.Estado = false;
        return true;
    });
    public List<Producto> ObtenerProductosPorPrecio(decimal precioMinimo, decimal precioMaximo)
    {
        if (precioMinimo < 0 || precioMaximo < precioMinimo) throw new FaultException("Rango de precios inválido.");
        return context.Productos.AsNoTracking().Where(p => p.Estado && p.Precio >= precioMinimo && p.Precio <= precioMaximo).ToList();
    }
    public List<Producto> ObtenerProductosPorCategoria(int idCategoria) => context.Productos.AsNoTracking()
        .Where(p => p.Estado && p.IdCategoria == idCategoria).ToList();
}
