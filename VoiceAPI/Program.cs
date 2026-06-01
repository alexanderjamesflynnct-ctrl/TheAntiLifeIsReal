using System.Text.Json;
using Swashbuckle.AspNetCore.Swagger;
using kuraiaepiai.Source;
using System.Text;
using System.IO;
using Microsoft.Data.Sqlite;
using Dapper;
using Microsoft.Extensions.FileProviders;
using System.Reflection;
using Microsoft.OpenApi; // .NET 10 uses the flat namespace (no .Models)

var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURE CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy => {
        policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Content-Range", "Content-Length", "Accept-Ranges");
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. SWAGGER GENERATION
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Demonic Voices API",
        Description = "A harmonic vocal synthesis engine for manifesting sinister audio."
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// 3. DATABASE INITIALIZATION
const string connectionString = "Data Source=voice_vault.db";
using (var connection = new SqliteConnection(connectionString))
{
    connection.Open();
    connection.Execute(@"CREATE TABLE IF NOT EXISTS VoiceCreations (Id INTEGER PRIMARY KEY AUTOINCREMENT, CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, Text TEXT, Voice TEXT, FileName TEXT, EdgePitch INTEGER, EdgeRate INTEGER, ShiftMain REAL, ShiftHarmony REAL, ShiftSub REAL, SubGain REAL, HarmonyGain REAL, DelayMs INTEGER, LowPass INTEGER, EchoDelay INTEGER, EchoDecay INTEGER)");
    connection.Execute(@"CREATE TABLE IF NOT EXISTS CodeStats (Ext TEXT, Lines INTEGER, Count INTEGER)");
    connection.Execute(@"CREATE TABLE IF NOT EXISTS LibraryVersions (Library TEXT, Version TEXT, SecureVersion TEXT, Status TEXT)");
    connection.Execute(@"CREATE TABLE IF NOT EXISTS SpellMap (Id INTEGER PRIMARY KEY AUTOINCREMENT, UI TEXT, Controller TEXT, Action TEXT, Route TEXT, Verb TEXT, SQL TEXT, TargetTable TEXT, SampleJson TEXT)");
}

// 4. MIDDLEWARE PIPELINE
app.UseCors("AllowReact");

app.UseSwagger();
app.UseSwaggerUI(options => {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Demonic Voices API v1");
    options.RoutePrefix = "swagger"; 
});

app.UseDefaultFiles();
app.UseStaticFiles(); 

// Serve audio files from wwwroot/audio
var audioPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio");
if (!Directory.Exists(audioPath)) Directory.CreateDirectory(audioPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(audioPath),
    RequestPath = "/audio"
});

app.MapControllers();


// <clearapi-start>
if (app.Environment.IsDevelopment())
{
    app.UseCors("KuraiaepiaiPolicy");
    app.MapGet("/clearapi/push", async (HttpContext context) => {
        try {
            string jsonContent = "";
            var swaggerProvider = context.RequestServices.GetService<ISwaggerProvider>();
            if (swaggerProvider != null) {
                var doc = swaggerProvider.GetSwagger("v1", null, "/");
                doc.Servers = new List<OpenApiServer> { new OpenApiServer { Url = $"{context.Request.Scheme}://{context.Request.Host}" } };
                using var sw = new StringWriter();
                doc.SerializeAsV3(new OpenApiJsonWriter(sw));
                jsonContent = sw.ToString();
            } else {
                using var client = new HttpClient();
                jsonContent = await client.GetStringAsync($"{context.Request.Scheme}://{context.Request.Host}/openapi/v1.json");
            }
            await File.WriteAllTextAsync("swagger.json", jsonContent, Encoding.UTF8);
            var report = await (new KuraiaepiaiReporter()).GenerateReport(Directory.GetCurrentDirectory(), jsonContent);
            using var client2 = new HttpClient();
            var response = await client2.PostAsJsonAsync("http://localhost:8000/api/collect", report);
            return response.IsSuccessStatusCode ? Results.Ok("Synced!") : Results.BadRequest("Sync failed.");
        } catch (Exception ex) { return Results.Problem(ex.Message); }
    });
}
// <clearapi-end>
app.Run();