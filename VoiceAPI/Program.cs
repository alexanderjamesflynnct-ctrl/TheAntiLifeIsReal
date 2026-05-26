using Microsoft.Data.Sqlite;
using Dapper;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy => {
        policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
              .AllowAnyHeader().AllowAnyMethod();
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

const string connectionString = "Data Source=voice_vault.db";
using (var connection = new SqliteConnection(connectionString))
{
    connection.Open();
    connection.Execute(@"CREATE TABLE IF NOT EXISTS VoiceCreations (Id INTEGER PRIMARY KEY AUTOINCREMENT, CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, Text TEXT, Voice TEXT, FileName TEXT, EdgePitch INTEGER, EdgeRate INTEGER, ShiftMain REAL, ShiftHarmony REAL, ShiftSub REAL, SubGain REAL, HarmonyGain REAL, DelayMs INTEGER, LowPass INTEGER, EchoDelay INTEGER, EchoDecay INTEGER)");
    
    // Developer Tables
    connection.Execute("CREATE TABLE IF NOT EXISTS CodeStats (Ext TEXT, Lines INTEGER, Count INTEGER)");
    connection.Execute("CREATE TABLE IF NOT EXISTS LibraryVersions (Library TEXT, Version TEXT, SecureVersion TEXT, Status TEXT)");
    
    // Inside the SpellMap table creation string in Program.cs:
    connection.Execute(@"CREATE TABLE IF NOT EXISTS SpellMap (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        UI TEXT, 
        Controller TEXT, 
        Action TEXT, 
        Route TEXT, 
        Verb TEXT, 
        SQL TEXT, 
        TargetTable TEXT,
        SampleJson TEXT -- NEW COLUMN
    )");
}

app.UseCors("AllowReact");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio")),
    RequestPath = "/audio"
});
app.MapControllers();
app.Run();