import React, { useRef } from "react";
import { Activity, Play } from "lucide-react";
import { Slider } from "./Common";
import AudioVisualizer from "./AudioVisualizer";

export default function Studio({
  voices,
  loadingVoices,
  sets,
  setSets,
  manifest,
  loading,
  audioUrl,
}) {
  const audioRef = useRef(null);

  return (
    <div className="bg-[#0c0c0c] border border-zinc-800 rounded-3xl p-8 space-y-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Entity & Script */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase flex items-center gap-2">
            Source Entity{" "}
            {loadingVoices && (
              <Activity size={10} className="animate-spin text-[#ff0033]" />
            )}
          </label>
          <select
            className="w-full bg-black border border-zinc-800 p-3 text-white rounded-xl outline-none focus:border-[#ff0033]"
            value={sets.voice}
            onChange={(e) => setSets({ ...sets, voice: e.target.value })}
          >
            {voices?.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
            Incantation
          </label>
          <textarea
            className="w-full bg-black border border-zinc-800 p-3 text-white rounded-xl h-14 outline-none focus:border-[#ff0033] transition-all resize-none"
            value={sets.text}
            onChange={(e) => setSets({ ...sets, text: e.target.value })}
          />
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 py-8 border-y border-zinc-900/50">
        {/* Group 1: Pitch & Speed */}
        <div className="space-y-6">
          <h3 className="text-[9px] font-black text-zinc-700 uppercase border-b border-zinc-900 pb-2">
            Vocal Foundation
          </h3>
          <Slider
            label="Main Octave"
            val={sets.shiftMain}
            min="-2"
            max="0.5"
            onChange={(v) => setSets({ ...sets, shiftMain: v })}
          />
          <Slider
            label="Temporal Rate"
            val={sets.edgeRate}
            min="-50"
            max="50"
            step={1}
            onChange={(v) => setSets({ ...sets, edgeRate: Math.round(v) })}
          />
          <Slider
            label="Base Pitch"
            val={sets.edgePitch}
            min="-100"
            max="50"
            step={1}
            onChange={(v) => setSets({ ...sets, edgePitch: Math.round(v) })}
          />
        </div>

        {/* Group 2: Harmony & Abyss */}
        <div className="space-y-6">
          <h3 className="text-[9px] font-black text-zinc-700 uppercase border-b border-zinc-900 pb-2">
            Chord Layers
          </h3>
          <Slider
            label="Harmony Chord"
            val={sets.shiftHarmony}
            min="-2"
            max="0.5"
            onChange={(v) => setSets({ ...sets, shiftHarmony: v })}
          />
          <Slider
            label="Abyssal Layer"
            val={sets.shiftSub}
            min="-2"
            max="0.5"
            onChange={(v) => setSets({ ...sets, shiftSub: v })}
          />
          <Slider
            label="Vocal Delay"
            val={sets.delayMs}
            min="0"
            max="200"
            step={1}
            onChange={(v) => setSets({ ...sets, delayMs: Math.round(v) })}
          />
        </div>

        {/* Group 3: Environment & Power */}
        <div className="space-y-6">
          <h3 className="text-[9px] font-black text-zinc-700 uppercase border-b border-zinc-900 pb-2">
            Atmosphere
          </h3>
          <Slider
            label="Echo Delay"
            val={sets.echoDelay}
            min="0"
            max="1000"
            step={10}
            onChange={(v) => setSets({ ...sets, echoDelay: Math.round(v) })}
          />
          <Slider
            label="Dampening"
            val={sets.lowPass}
            min="500"
            max="5000"
            step={100}
            onChange={(v) => setSets({ ...sets, lowPass: Math.round(v) })}
          />
          <Slider
            label="Sub Power"
            val={sets.subGain}
            min="-40"
            max="0"
            onChange={(v) => setSets({ ...sets, subGain: v })}
          />
        </div>
      </div>

      <button
        onClick={manifest}
        disabled={loading}
        className="w-full bg-[#ff0033] p-6 rounded-2xl text-white font-black uppercase tracking-[0.4em] shadow-lg shadow-red-900/20 hover:scale-[1.01] active:scale-95 transition-all flex justify-center items-center gap-3"
      >
        {loading ? (
          <Activity className="animate-spin" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
        {loading ? "Manifesting..." : "Manifest Demonic Voice"}
      </button>

      {audioUrl && (
        <div className="mt-6 p-6 bg-black rounded-2xl border border-[#ff0033]/20 animate-in zoom-in-95 duration-300">
          <AudioVisualizer audioRef={audioRef} />
          <audio
            id="studioPlayer"
            ref={audioRef}
            crossOrigin="anonymous"
            key={audioUrl}
            src={audioUrl}
            controls
            autoPlay
            className="w-full invert hue-rotate-180 brightness-150 contrast-125"
          />
        </div>
      )}
    </div>
  );
}
