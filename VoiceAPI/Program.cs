using Microsoft.Data.Sqlite;
using Dapper;
using Microsoft.Extensions.FileProviders;
using System.Reflection;
// FIXED: Namespace is now flat in v3.x
using Microsoft.OpenApi; 

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

// 2. ENHANCED SWAGGER GENERATION
builder.Services.AddSwaggerGen(options =>
{
    // Note: We use 'OpenApiInfo' directly from Microsoft.OpenApi
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Demonic Voices API",
        Description = "A harmonic vocal synthesis engine for manifesting sinister audio.",
        Contact = new OpenApiContact
        {
            Name = "Architect of the Void",
            Email = "architect@abyss.local"
        }
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

// Enable Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options => {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Demonic Voices API v1");
    options.RoutePrefix = "swagger"; 
});

app.UseDefaultFiles();
app.UseStaticFiles(); 

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio")),
    RequestPath = "/audio"
});

app.MapControllers();

var audioPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio");
if (!Directory.Exists(audioPath)) Directory.CreateDirectory(audioPath);

app.Run();