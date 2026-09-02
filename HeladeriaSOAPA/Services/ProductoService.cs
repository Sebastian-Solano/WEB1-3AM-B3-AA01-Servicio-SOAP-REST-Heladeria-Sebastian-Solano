using HeladeriaSOAPA.Data;
using HeladeriaSOAPA.Models;
using Microsoft.EntityFrameworkCore;

namespace HeladeriaSOAPA.Services
{
    public class ProductoService : IProductoService
    {
        private readonly ProductosDBContext _context;
        public ProductoService(ProductosDBContext context)
        {
            _context = context;
        }
        public List<Categoria> ObtenerCategorias()
        {
            return _context.Categorias
                .AsNoTracking()
                .Where(c => c.Estado)
                .ToList();
        }
        public List<Producto> ObtenerProductos()
        {
            return _context.Productos
                .AsNoTracking()
                .Where(p => p.Estado)
                .ToList();
        }
        public Producto? ObtenerProducto(int id)
        {
            return _context.Productos
                .AsNoTracking()
                .FirstOrDefault(p =>
                    p.IdProducto == id &&
                    p.Estado);
        }
        public Producto AgregarProducto(Producto producto)
        {
            _context.Productos.Add(producto);
            _context.SaveChanges();
            return producto;
        }
        public bool ActualizarProducto(Producto producto)
        {
            Producto? productoExistente =
                _context.Productos.FirstOrDefault(
                    p => p.IdProducto == producto.IdProducto);
            if (productoExistente == null)
            {
                return false;
            }
            productoExistente.Nombre = producto.Nombre;
            productoExistente.Descripcion = producto.Descripcion;
            productoExistente.Precio = producto.Precio;
            productoExistente.Stock = producto.Stock;
            productoExistente.Estado = producto.Estado;
            productoExistente.IdCategoria = producto.IdCategoria;
            _context.SaveChanges();
            return true;
        }
        public bool EliminarProducto(int id)
        {
            Producto? producto =
                _context.Productos.FirstOrDefault(
                    p => p.IdProducto == id);
            if (producto == null)
            {
                return false;
            }
            producto.Estado = false;
            _context.SaveChanges();
            return true;
        }
        public List<Producto> ObtenerProductosPorPrecio(
            decimal precioMinimo,
            decimal precioMaximo)
        {
            return _context.Productos
                .AsNoTracking()
                .Where(p =>
                    p.Precio >= precioMinimo &&
                    p.Precio <= precioMaximo &&
                    p.Estado)
                .ToList();
        }
        public List<Producto> ObtenerProductosPorCategoria(
            int idCategoria)
        {
            return _context.Productos
                .AsNoTracking()
                .Where(p =>
                    p.IdCategoria == idCategoria &&
                    p.Estado)
                .ToList();
        }
    }
}
