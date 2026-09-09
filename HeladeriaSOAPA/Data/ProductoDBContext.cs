using Microsoft.EntityFrameworkCore;
using HeladeriaSOAPA.Models;

namespace HeladeriaSOAPA.Data
{
    public class ProductosDBContext : DbContext
    {
        public ProductosDBContext(
            DbContextOptions<ProductosDBContext> options)
            : base(options)
        {
        }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<MovimientoInventario> Movimientos { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Producto>().HasOne<Categoria>().WithMany()
                .HasForeignKey(p => p.IdCategoria).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<MovimientoInventario>().HasOne<Producto>().WithMany()
                .HasForeignKey(m => m.IdProducto).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
