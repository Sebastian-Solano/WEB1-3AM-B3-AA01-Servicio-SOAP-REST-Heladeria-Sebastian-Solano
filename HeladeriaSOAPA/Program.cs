using HeladeriaSOAPA.Data;
using HeladeriaSOAPA.Services;
using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Services.AddDbContext<ProductosDBContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("ConexionSQL"),
        sqlServerOptions => sqlServerOptions.CommandTimeout(30)
    )
);
builder.Services.AddServiceModelServices();
builder.Services.AddServiceModelMetadata();
builder.Services.AddScoped<ProductoService>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
    .AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseCors();
app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder.AddService<ProductoService>();
    serviceBuilder.AddServiceEndpoint<ProductoService, IProductoService>(new BasicHttpBinding(),"/ProductoService.asmx");
});
var metadata = app.Services.GetRequiredService<ServiceMetadataBehavior>();
metadata.HttpGetEnabled = true;
metadata.HttpsGetEnabled = true;

app.MapGet("/", () => Results.Redirect("/ProductoService.asmx?wsdl"));
app.Run();
