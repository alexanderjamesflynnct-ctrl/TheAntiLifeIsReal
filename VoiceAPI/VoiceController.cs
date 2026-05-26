using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.Data.Sqlite;
using Dapper;

[ApiController]
[Route("api/[controller]")]
public class VoiceController : ControllerBase
{
    private readonly string _pythonPath = @"C:\Users\lex\AppData\Local\Python\pythoncore-3.14-64\python.exe";
    private readonly string _connectionString = "Data Source=voice_vault.db";

    [HttpGet("list")]
    public async Task<IActionResult> ListVoices()
    {
        try {
            string scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "voice_engine.py");
            var startInfo = new ProcessStartInfo {
                FileName = _pythonPath, Arguments = $"\"{scriptPath}\" --list",
                RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true
            };
            using var process = Process.Start(startInfo);
            return Content(await process.StandardOutput.ReadToEndAsync(), "application/json");
        } catch (Exception ex) { return StatusCode(500, ex.Message); }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        try {
            using var db = new SqliteConnection(_connectionString);
            var history = await db.QueryAsync("SELECT * FROM VoiceCreations ORDER BY CreatedAt DESC LIMIT 50");
            return Ok(history);
        } catch (Exception ex) { return StatusCode(500, ex.Message); }
    }

    [HttpDelete("history/{id}")]
    public async Task<IActionResult> DeleteHistory(int id)
    {
        try {
            using var db = new SqliteConnection(_connectionString);
            var file = await db.QueryFirstOrDefaultAsync<string>("SELECT FileName FROM VoiceCreations WHERE Id = @id", new { id });
            await db.ExecuteAsync("DELETE FROM VoiceCreations WHERE Id = @id", new { id });
            if (!string.IsNullOrEmpty(file)) {
                string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio", file);
                if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
            }
            return Ok();
        } catch (Exception ex) { return StatusCode(500, ex.Message); }
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] VoiceRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try {
            string audioFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio");
            if (!Directory.Exists(audioFolder)) Directory.CreateDirectory(audioFolder);

            string fileName = $"{request.FileNameBase}_{Guid.NewGuid().ToString().Substring(0, 8)}.wav";
            string fullPath = Path.Combine(audioFolder, fileName);
            string scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "voice_engine.py");

            string args = $"\"{scriptPath}\" --text \"{request.Text}\" --voice \"{request.Voice}\" --output_path \"{fullPath}\" " +
                          $"--edge_pitch {request.EdgePitch} --edge_rate {request.EdgeRate} " +
                          $"--shift_main {request.ShiftMain} --shift_harmony {request.ShiftHarmony} " +
                          $"--harmony_gain {request.HarmonyGain} --shift_sub {request.ShiftSub} " +
                          $"--sub_gain {request.SubGain} --delay_ms {request.DelayMs} --low_pass {request.LowPass} " +
                          $"--echo_delay {request.EchoDelay} --echo_decay {request.EchoDecay}";

            var startInfo = new ProcessStartInfo { 
                FileName = _pythonPath, Arguments = args, 
                RedirectStandardError = true, UseShellExecute = false, CreateNoWindow = true 
            };

            using var process = Process.Start(startInfo);
            string err = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode == 0) {
                using var db = new SqliteConnection(_connectionString);

                // --- ROBUST SMART SAVE LOGIC ---
                var last = await db.QueryFirstOrDefaultAsync<dynamic>("SELECT * FROM VoiceCreations ORDER BY CreatedAt DESC LIMIT 1");
                
                bool isDup = false;
                if (last != null) {
                    try {
                        // Check every relevant field. Convert is used to handle SQLite types safely.
                        isDup = last.Text == request.Text && 
                                last.Voice == request.Voice && 
                                Math.Abs(Convert.ToDouble(last.ShiftMain) - request.ShiftMain) < 0.001 &&
                                Math.Abs(Convert.ToDouble(last.ShiftHarmony) - request.ShiftHarmony) < 0.001 &&
                                Convert.ToInt32(last.EdgeRate) == request.EdgeRate &&
                                Convert.ToInt32(last.EchoDelay) == request.EchoDelay;
                    } catch { isDup = false; }
                }

                if (!isDup) {
                    await db.ExecuteAsync(@"
                        INSERT INTO VoiceCreations (Text, Voice, FileName, EdgePitch, EdgeRate, ShiftMain, ShiftHarmony, ShiftSub, SubGain, HarmonyGain, DelayMs, LowPass, EchoDelay, EchoDecay) 
                        VALUES (@Text, @Voice, @fileName, @EdgePitch, @EdgeRate, @ShiftMain, @ShiftHarmony, @ShiftSub, @SubGain, @HarmonyGain, @DelayMs, @LowPass, @EchoDelay, @EchoDecay)", 
                        new { 
                            request.Text, request.Voice, fileName, request.EdgePitch, request.EdgeRate, 
                            request.ShiftMain, request.ShiftHarmony, request.ShiftSub, request.SubGain, 
                            request.HarmonyGain, request.DelayMs, request.LowPass, 
                            request.EchoDelay, request.EchoDecay 
                        });
                }
                return Ok(new { url = $"/audio/{fileName}" });
            }
            return StatusCode(500, err);
        } catch (Exception ex) { return StatusCode(500, ex.Message); }
    }
}