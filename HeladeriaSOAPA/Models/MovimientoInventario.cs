using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeladeriaSOAPA.Models;

[Table("MovimientoInventario")]
public class MovimientoInventario
{
    [Key] public int IdMovimiento { get; set; }
    public int IdProducto { get; set; }
    [Required, StringLength(7)] public string TipoMovimiento { get; set; } = "Entrada";
    [Range(1, int.MaxValue)] public int Cantidad { get; set; }
    public DateTime FechaMovimiento { get; set; }
    [StringLength(250)] public string? Observacion { get; set; }
}
