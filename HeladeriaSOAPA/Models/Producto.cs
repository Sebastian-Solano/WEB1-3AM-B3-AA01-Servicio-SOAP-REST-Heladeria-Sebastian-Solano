using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeladeriaSOAPA.Models
{
    [Table("Producto")]
    public class Producto
    {
        [Key]
        [Column("IdProducto")]
        public int IdProducto { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Descripcion { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Precio { get; set; }

        [Required]
        public int Stock { get; set; }

        [Required]
        public bool Estado { get; set; }

        [Required]
        public int IdCategoria { get; set; }
    }
}