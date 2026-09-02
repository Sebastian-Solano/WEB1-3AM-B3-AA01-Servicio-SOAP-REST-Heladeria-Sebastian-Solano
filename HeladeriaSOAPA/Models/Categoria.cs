using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeladeriaSOAPA.Models
{
    [Table("Categoria")]
    public class Categoria
    {
        [Key]
        [Column("IdCategoria")]
        public int IdCategoria { get; set; }
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;
        [StringLength(250)]
        public string? Descripcion { get; set; }
        [Required]
        public bool Estado { get; set; }
    }
}