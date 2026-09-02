using CoreWCF;
using HeladeriaSOAPA.Models;

namespace HeladeriaSOAPA.Services
{
    [ServiceContract]
    public interface IProductoService
    {
        [OperationContract]
        List<Categoria> ObtenerCategorias();

        [OperationContract]
        List<Producto> ObtenerProductos();

        [OperationContract]
        Producto? ObtenerProducto(int id);

        [OperationContract]
        Producto AgregarProducto(Producto producto);

        [OperationContract]
        bool ActualizarProducto(Producto producto);

        [OperationContract]
        bool EliminarProducto(int id);

        [OperationContract]
        List<Producto> ObtenerProductosPorPrecio(
            decimal precioMinimo,
            decimal precioMaximo);

        [OperationContract]
        List<Producto> ObtenerProductosPorCategoria(
            int idCategoria);
    }
}