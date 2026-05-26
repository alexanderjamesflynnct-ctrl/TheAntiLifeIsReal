using System.ComponentModel.DataAnnotations;

public class VoiceRequest
{
    [Required] 
    public string Text { get; set; } = "Demonic Voices are hot";

    [Required] 
    public string Voice { get; set; } = "en-US-EmmaNeural";

    public string FileNameBase { get; set; } = "demonic_gen";

    public int EdgePitch { get; set; } = -30;
    
    public int EdgeRate { get; set; } = -25; // Matching screenshot

    public double ShiftMain { get; set; } = -0.06; // Matching screenshot

    public double ShiftHarmony { get; set; } = -0.51; // Matching screenshot

    public double ShiftSub { get; set; } = -1.0;

    public double SubGain { get; set; } = -12.0;

    public double HarmonyGain { get; set; } = -7.0;

    public int DelayMs { get; set; } = 0;

    public int LowPass { get; set; } = 2500;

    public int EchoDelay { get; set; } = 110; // Matching screenshot

    public int EchoDecay { get; set; } = 10;
}