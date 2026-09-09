using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PedidosREST.Api.Models;

public class Cliente
{
    [Key]
    public int IdCliente { get; set; }

    public string? Cedula { get; set; }
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public int? Edad { get; set; }
    public decimal? Peso { get; set; }
    public bool Estado { get; set; }

    // Evita ciclos al convertir Cliente -> Pedidos -> Cliente a JSON.
    [JsonIgnore]
    public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}
