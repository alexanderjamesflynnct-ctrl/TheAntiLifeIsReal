import { Database } from "lucide-react";

export function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-[#ff0033] text-white shadow-lg shadow-red-900/40" : "text-zinc-500 hover:text-zinc-300"}`}
    >
      {icon} {label}
    </button>
  );
}

export function DevTabBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-black uppercase tracking-widest transition-all border-b-2 pb-3 ${active ? "text-[#ff0033] border-[#ff0033]" : "text-zinc-700 border-transparent hover:text-zinc-400"}`}
    >
      {label}
    </button>
  );
}

export function Slider({ label, min, max, val, step = "0.01", onChange }) {
  return (
    <div className="group">
      <div className="flex justify-between mb-4">
        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
          {label}
        </label>
        <span className="text-[#ff0033] font-mono text-[10px] font-bold bg-zinc-900/50 px-2 py-0.5 rounded-md">
          {val}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#ff0033]"
      />
    </div>
  );
}

export function Box({ size, className }) {
  return <Database size={size} className={className} />;
}
