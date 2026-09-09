using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PedidosREST.Api.Models;

public class Pedido
{
    [Key]
    public int IdPedido { get; set; }

    [Required]
    public int IdCliente { get; set; }

    [Required]
    public DateTime FechaPedido { get; set; }

    [Required]
    [MaxLength(200)]
    public string Descripcion { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    [Range(typeof(decimal), "0.01", "99999999")]
    public decimal Total { get; set; }

    [Required]
    [MaxLength(30)]
    public string Estado { get; set; } = string.Empty;

    // Propiedad de navegación: IdCliente es la FK hacia Clientes.
    public Cliente? Cliente { get; set; }
}
