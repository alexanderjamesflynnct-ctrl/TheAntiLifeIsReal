using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Dapper;
using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Routing;

[ApiController]
[Route("api/[controller]")]
public class DeveloperController : ControllerBase
{
    private readonly string _conn = "Data Source=voice_vault.db";

[HttpGet("grimoire")]
public IActionResult DownloadSwaggerJson()
{
    // The file was generated in the root VoiceAPI folder
    string path = Path.Combine(Directory.GetCurrentDirectory(), "swagger.json");

    if (!System.IO.File.Exists(path))
    {
        return NotFound("The swagger.json grimoire has not been manifested yet. Run the CLI tool.");
    }

    var bytes = System.IO.File.ReadAllBytes(path);
    return File(bytes, "application/json", "demonic_voices_api.json");
}

[HttpPost("refresh")]
public async Task<IActionResult> RefreshCodebase()
{
    using var db = new SqliteConnection(_conn);
    await db.OpenAsync();
    using var trans = db.BeginTransaction();

    try
    {
        // --- 1. SCAN FILESYSTEM (For Stats & Graphs) ---
        var root = Directory.GetCurrentDirectory();
        var workspaceRoot = Directory.GetParent(root)?.FullName ?? root;
        var exts = new[] { ".cs", ".py", ".jsx", ".css", ".html" };

        var fileList = Directory.GetFiles(workspaceRoot, "*.*", SearchOption.AllDirectories)
            .Where(f => exts.Contains(Path.GetExtension(f)) &&
                        !f.Contains("node_modules") && !f.Contains("bin") &&
                        !f.Contains("obj") && !f.Contains(".git") &&
                        !f.Contains("wwwroot\\audio") && // Ignore audio folder to prevent lag
                        !f.Contains("voice_vault.db"))   // Ignore database file
            .ToList();

        await db.ExecuteAsync("DELETE FROM CodeStats", null, trans);

        foreach (var ext in exts)
        {
            var extFiles = fileList.Where(f => Path.GetExtension(f) == ext).ToList();
            int lineCount = 0;
            foreach (var f in extFiles)
            {
                try { lineCount += System.IO.File.ReadLines(f).Count(); } catch { /* Skip locked files */ }
            }
            
            var stat = new CodeStatDto { ext = ext, lines = lineCount, count = extFiles.Count };
            await db.ExecuteAsync("INSERT INTO CodeStats (Ext, Lines, Count) VALUES (@ext, @lines, @count)", stat, trans);
        }

        // --- 2. LOGIC MAP & API DISCOVERY (For Explorer & Logic Map) ---
        await db.ExecuteAsync("DELETE FROM SpellMap", null, trans);
        var controllers = Assembly.GetExecutingAssembly().GetTypes()
            .Where(type => typeof(ControllerBase).IsAssignableFrom(type));

        foreach (var controller in controllers)
        {
            var methods = controller.GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
                .Where(m => m.GetCustomAttributes<HttpMethodAttribute>().Any());

            foreach (var method in methods)
            {
                var httpAttr = method.GetCustomAttribute<HttpMethodAttribute>();
                string actionName = method.Name;
                string ctrlName = controller.Name.Replace("Controller", "");
                
                string routeTemplate = httpAttr?.Template ?? actionName.ToLower();
                string fullRoute = $"/api/{ctrlName}/{routeTemplate}";

                // Generate Sample JSON based on Method Type
                string sample = actionName switch {
                    "Generate" => "{\n  \"text\": \"Demonic Voices are hot\",\n  \"voice\": \"en-US-EmmaNeural\",\n  \"edgeRate\": -25,\n  \"shiftMain\": -0.06,\n  \"shiftHarmony\": -0.51,\n  \"echoDelay\": 110\n}",
                    "DeleteHistory" => "{\n  \"id\": 1\n}",
                    _ => "{}"
                };

                var entry = new SpellMapDto {
                    UI = actionName == "Generate" ? "Manifest UI" : "System logic",
                    Controller = ctrlName,
                    Action = actionName,
                    Route = fullRoute,
                    Verb = httpAttr?.HttpMethods.FirstOrDefault() ?? "GET",
                    SQL = actionName == "Generate" ? "INSERT" : actionName.Contains("History") ? "SELECT/DELETE" : "N/A",
                    TargetTable = actionName.Contains("History") || actionName == "Generate" ? "VoiceCreations" : "N/A",
                    SampleJson = sample
                };

                await db.ExecuteAsync(@"
                    INSERT INTO SpellMap (UI, Controller, Action, Route, Verb, SQL, TargetTable, SampleJson) 
                    VALUES (@UI, @Controller, @Action, @Route, @Verb, @SQL, @TargetTable, @SampleJson)", 
                    entry, trans);
            }
        }

        // --- 3. LIBRARY VERSIONS (Populates the Libraries Tab) ---
        await db.ExecuteAsync("DELETE FROM LibraryVersions", null, trans);
        var versions = new List<LibVersionDto> {
            new LibVersionDto { Library = "ASP.NET Core", Version = "10.0", SecureVersion = "10.0", Status = "Secure" },
            new LibVersionDto { Library = "React (Vite)", Version = "18.3.1", SecureVersion = "18.3.1", Status = "Secure" },
            new LibVersionDto { Library = "Tailwind CSS", Version = "4.0.0", SecureVersion = "4.0.0", Status = "Secure" },
            new LibVersionDto { Library = "Dapper ORM", Version = "2.1.35", SecureVersion = "2.1.35", Status = "Secure" },
            new LibVersionDto { Library = "Microsoft.Data.Sqlite", Version = "9.0.0", SecureVersion = "9.0.0", Status = "Secure" }
        };

        foreach (var v in versions)
        {
            await db.ExecuteAsync(@"
                INSERT INTO LibraryVersions (Library, Version, SecureVersion, Status) 
                VALUES (@Library, @Version, @SecureVersion, @Status)", 
                v, trans);
        }

        trans.Commit();
        return Ok(new { message = "Demonic Archives Re-Indexed Successfully" });
    }
    catch (Exception ex)
    {
        trans.Rollback();
        return StatusCode(500, $"Refresh Failed: {ex.Message}");
    }
}

    [HttpGet("scan")]
    public async Task<IActionResult> GetScan() {
        using var db = new SqliteConnection(_conn);
        var stats = await db.QueryAsync("SELECT Ext as ext, Lines as lines, Count as count FROM CodeStats");
        return Ok(new { stats, totalLines = stats.Sum(x => (int)x.lines) });
    }

    [HttpGet("spell-map")]
    public async Task<IActionResult> GetMap() {
        using var db = new SqliteConnection(_conn);
        return Ok(await db.QueryAsync("SELECT * FROM SpellMap"));
    }

    [HttpGet("versions")]
    public async Task<IActionResult> GetVersions() {
        using var db = new SqliteConnection(_conn);
        return Ok(await db.QueryAsync("SELECT * FROM LibraryVersions"));
    }
}

public class CodeStatDto { public string ext { get; set; } = ""; public int lines { get; set; } public int count { get; set; } }
public class SpellMapDto { public string UI { get; set; } = ""; public string Controller { get; set; } = ""; public string Action { get; set; } = ""; public string Route { get; set; } = ""; public string Verb { get; set; } = ""; public string SQL { get; set; } = ""; public string TargetTable { get; set; } = ""; public string SampleJson { get; set; } = ""; }
public class LibVersionDto { public string Library { get; set; } = ""; public string Version { get; set; } = ""; public string SecureVersion { get; set; } = ""; public string Status { get; set; } = ""; }