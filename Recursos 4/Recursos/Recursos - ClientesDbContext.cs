using Microsoft.EntityFrameworkCore;
using PedidosREST.Api.Models;

namespace PedidosREST.Api.Data;

public class ClientesDbContext : DbContext
{
    public ClientesDbContext(DbContextOptions<ClientesDbContext> options)
        : base(options)
    {
    }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.ToTable("Clientes");
            entity.HasKey(c => c.IdCliente);
        });

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.ToTable("Pedidos");
            entity.HasKey(p => p.IdPedido);

            entity.Property(p => p.Descripcion)
                  .HasMaxLength(200)
                  .IsRequired();

            entity.Property(p => p.Total)
                  .HasColumnType("decimal(10,2)");

            entity.Property(p => p.Estado)
                  .HasMaxLength(30)
                  .IsRequired();

            entity.HasOne(p => p.Cliente)
                  .WithMany(c => c.Pedidos)
                  .HasForeignKey(p => p.IdCliente)
                  .OnDelete(DeleteBehavior.Restrict)
                  .HasConstraintName("FK_Pedidos_Clientes");
        });
    }
}
