import React, { useEffect, useRef } from "react";

export default function AudioVisualizer({ audioRef, isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    // 1. Initialize Audio Context on first play
    const initAudio = () => {
      if (contextRef.current) return;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const analyser = context.createAnalyser();

      // Connect audio element to analyser
      const source = context.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(context.destination);

      // Configure FFT (Fast Fourier Transform)
      analyser.fftSize = 64; // Small number = fewer, wider bars

      contextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
    };

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Frequency value is 0-255
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Draw demonic red bars
        ctx.fillStyle = "#ff0033";
        // Add a glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0033";

        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const handlePlay = () => {
      initAudio();
      if (contextRef.current.state === "suspended") {
        contextRef.current.resume();
      }
      draw();
    };

    const audioEl = audioRef.current;
    audioEl.addEventListener("play", handlePlay);

    return () => {
      audioEl.removeEventListener("play", handlePlay);
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={80}
      className="w-full h-20 mb-4"
    />
  );
}
