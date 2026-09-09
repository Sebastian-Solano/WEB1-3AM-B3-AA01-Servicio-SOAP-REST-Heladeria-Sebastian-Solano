using HeladeriaSOAPA.Data;
using HeladeriaSOAPA.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ProductosDBContext>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("ConexionSQL")));
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200").AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseCors();
app.Use(async (context, next) =>
{
    try { await next(); }
    catch (Exception e) when (e is DbUpdateException or SqlException)
    {
        app.Logger.LogError(e, "Error de persistencia de inventario");
        await Results.Problem("No se pudo guardar o consultar el inventario. Verifique SQL Server y recargue antes de reintentar.", statusCode: 409).ExecuteAsync(context);
    }
});
app.MapGet("/", () => new { servicio = "Inventario REST", endpoints = "/api/movimientos" });
app.MapGet("/api/movimientos", async (int? idProducto, ProductosDBContext db) =>
    await db.Movimientos.AsNoTracking().Where(m => !idProducto.HasValue || m.IdProducto == idProducto)
        .OrderByDescending(m => m.FechaMovimiento).ThenByDescending(m => m.IdMovimiento).ToListAsync());
app.MapGet("/api/movimientos/{id:int}", async (int id, ProductosDBContext db) =>
    await db.Movimientos.AsNoTracking().FirstOrDefaultAsync(m => m.IdMovimiento == id) is { } m ? Results.Ok(m) : Results.NotFound());
app.MapPost("/api/movimientos", async (MovimientoInventario entrada, ProductosDBContext db) =>
    await Modificar(null, entrada, false, db));
app.MapPut("/api/movimientos/{id:int}", async (int id, MovimientoInventario entrada, ProductosDBContext db) =>
    await Modificar(id, entrada, false, db));
app.MapDelete("/api/movimientos/{id:int}", async (int id, ProductosDBContext db) =>
    await Modificar(id, null, true, db));
app.Run();

static async Task<IResult> Modificar(int? id, MovimientoInventario? entrada, bool eliminar, ProductosDBContext db)
{
    if (!eliminar && (entrada == null || entrada.IdProducto <= 0 || entrada.Cantidad <= 0 ||
        entrada.TipoMovimiento is not ("Entrada" or "Salida") || entrada.Observacion?.Length > 250))
        return Results.BadRequest(new { mensaje = "Seleccione producto, tipo Entrada/Salida, cantidad entera positiva y observación de hasta 250 caracteres." });
    // La transacción bloquea las filas leídas hasta confirmar movimiento y stock juntos.
    using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
    var actual = id.HasValue ? await db.Movimientos.FindAsync(id.Value) : null;
    if (id.HasValue && actual == null) return Results.NotFound(new { mensaje = "El movimiento no existe." });
    if (actual != null && entrada != null && actual.IdProducto != entrada.IdProducto)
        return Results.BadRequest(new { mensaje = "El producto de un movimiento existente no se puede cambiar." });
    var producto = await db.Productos.FindAsync(actual?.IdProducto ?? entrada!.IdProducto);
    if (producto == null || (!eliminar && !producto.Estado))
        return Results.BadRequest(new { mensaje = "El producto no existe o está inactivo." });
    long anterior = actual == null ? 0 : actual.TipoMovimiento == "Entrada" ? actual.Cantidad : -(long)actual.Cantidad;
    long nuevo = eliminar ? 0 : entrada!.TipoMovimiento == "Entrada" ? entrada.Cantidad : -(long)entrada.Cantidad;
    long stock = producto.Stock - anterior + nuevo;
    if (stock < 0 || stock > int.MaxValue)
        return Results.Conflict(new { mensaje = "Stock insuficiente o fuera de rango. La operación no se guardó." });
    producto.Stock = (int)stock;
    if (eliminar) db.Movimientos.Remove(actual!);
    else if (actual == null)
    {
        entrada!.IdMovimiento = 0;
        entrada.FechaMovimiento = DateTime.UtcNow;
        db.Movimientos.Add(entrada);
    }
    else
    {
        actual.TipoMovimiento = entrada!.TipoMovimiento;
        actual.Cantidad = entrada.Cantidad;
        actual.Observacion = entrada.Observacion;
    }
    await db.SaveChangesAsync();
    await tx.CommitAsync();
    return eliminar ? Results.NoContent() : id.HasValue ? Results.Ok(actual) : Results.Created($"/api/movimientos/{entrada!.IdMovimiento}", entrada);
}
