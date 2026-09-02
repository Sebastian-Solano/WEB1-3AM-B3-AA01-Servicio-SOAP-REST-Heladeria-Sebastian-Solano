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
        sqlServerOptions => sqlServerOptions.EnableRetryOnFailure()
    )
);
builder.Services.AddServiceModelServices();
builder.Services.AddServiceModelMetadata();
builder.Services.AddScoped<ProductoService>();
var app = builder.Build();
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
