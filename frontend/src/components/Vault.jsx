import React from "react";
import {
  Zap,
  Trash2,
  Activity,
  Waves,
  Clock,
  Wind,
  Speaker,
  Skull,
} from "lucide-react";

export default function Vault({
  history,
  loadingHistory,
  deletingId,
  zapToStudio,
  deleteItem,
}) {
  if (loadingHistory)
    return (
      <div className="text-center py-40 uppercase text-xs font-black tracking-widest animate-pulse flex flex-col items-center gap-4">
        <Activity className="animate-spin text-[#ff0033]" size={32} />
        <span>Consulting the Vault...</span>
      </div>
    );

  if (!history || history.length === 0)
    return (
      <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
        <p className="text-zinc-700 italic font-black uppercase text-[10px] tracking-widest">
          The archives are empty.
        </p>
      </div>
    );

  return (
    <div className="max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar space-y-6 pb-20">
      {history.map((item, idx) => (
        <div
          key={item.Id || item.id || idx}
          className={`bg-[#0c0c0c] border border-zinc-900 p-6 rounded-3xl transition-all relative overflow-hidden group 
            ${deletingId === (item.Id || item.id) ? "opacity-20 scale-95" : "hover:border-[#ff0033]/40 shadow-xl"}`}
        >
          {/* Header Row */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex-1">
              <p className="text-white text-lg font-medium italic mb-1">
                "{item.Text || item.text}"
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[#ff0033] text-[10px] font-black uppercase tracking-[0.2em]">
                  {item.Voice || item.voice}
                </span>
                <span className="text-zinc-700 text-[9px] font-mono">
                  {new Date(
                    item.CreatedAt || item.createdAt || Date.now(),
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => zapToStudio(item)}
                className="p-3 bg-zinc-900/50 rounded-xl text-zinc-500 hover:text-blue-500 transition-all"
              >
                <Zap size={18} />
              </button>
              <button
                onClick={(e) => deleteItem(item.Id || item.id, e)}
                className="p-3 bg-zinc-900/50 rounded-xl text-zinc-500 hover:text-[#ff0033] transition-all"
              >
                {deletingId === (item.Id || item.id) ? (
                  <Activity size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Readout Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-zinc-900/50 relative z-10">
            <VaultGroup icon={<Waves size={12} />} label="Harmonics">
              <DataPoint label="Main" val={item.ShiftMain || item.shiftMain} />
              <DataPoint
                label="Chord"
                val={item.ShiftHarmony || item.shiftHarmony}
              />
              <DataPoint label="Abyss" val={item.ShiftSub || item.shiftSub} />
            </VaultGroup>

            <VaultGroup icon={<Clock size={12} />} label="Temporal">
              <DataPoint
                label="Rate"
                val={`${item.EdgeRate || item.edgeRate}%`}
              />
              <DataPoint
                label="Delay"
                val={`${item.DelayMs || item.delayMs}ms`}
              />
              <DataPoint
                label="Pitch"
                val={`${item.EdgePitch || item.edgePitch}Hz`}
              />
            </VaultGroup>

            <VaultGroup icon={<Wind size={12} />} label="FX">
              <DataPoint
                label="Echo"
                val={`${item.EchoDelay || item.echoDelay}ms`}
              />
              <DataPoint
                label="Decay"
                val={`${item.EchoDecay || item.echoDecay}dB`}
              />
              <DataPoint
                label="Muffle"
                val={`${item.LowPass || item.lowPass}Hz`}
              />
            </VaultGroup>

            <VaultGroup icon={<Speaker size={12} />} label="Power">
              <DataPoint
                label="Sub"
                val={`${item.SubGain || item.subGain}dB`}
              />
              <DataPoint
                label="Harm"
                val={`${item.HarmonyGain || item.harmonyGain}dB`}
              />
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-800 pt-1 uppercase">
                <span>ID Reference</span>
                <span>{item.Id || item.id}</span>
              </div>
            </VaultGroup>
          </div>

          <Skull
            className="absolute -right-4 -bottom-4 text-white opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform pointer-events-none"
            size={120}
          />
        </div>
      ))}
    </div>
  );
}

function VaultGroup({ icon, label, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-zinc-600">
        {icon}{" "}
        <span className="text-[9px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DataPoint({ label, val }) {
  return (
    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/[0.03] pb-0.5">
      <span className="text-zinc-600 uppercase text-[8px] tracking-tighter">
        {label}
      </span>
      <span className="text-[#ff0033] font-bold">{val ?? "0"}</span>
    </div>
  );
}
