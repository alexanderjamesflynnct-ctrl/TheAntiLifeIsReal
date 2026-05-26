import React from "react";
import { DevTabBtn } from "./Common";
import {
  RefreshCcw,
  BarChart3,
  Database,
  Terminal,
  Send,
  Layers,
  Hash,
  FileCode,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function SpellMap({
  devTab,
  setDevTab,
  syncArchive,
  loading,
  scanData,
  spellMap,
  versions,
  groupedApis,
  activeRoute,
  setActiveRoute,
  jsonInput,
  setJsonInput,
  testApi,
  apiResponse,
}) {
  return (
    <div className="animate-in fade-in duration-700">
      {/* 1. DEV HEADER & REFRESH */}
      <div className="flex justify-between items-end border-b border-zinc-900 mb-8 pb-6">
        <div className="flex gap-8">
          <DevTabBtn
            active={devTab === "scan"}
            onClick={() => setDevTab("scan")}
            label="01. Code Scan"
          />
          <DevTabBtn
            active={devTab === "map"}
            onClick={() => setDevTab("map")}
            label="02. Logic Map"
          />
          <DevTabBtn
            active={devTab === "ver"}
            onClick={() => setDevTab("ver")}
            label="03. Libraries"
          />
          <DevTabBtn
            active={devTab === "api"}
            onClick={() => setDevTab("api")}
            label="04. Explorer"
          />
        </div>
        <button
          onClick={syncArchive}
          disabled={loading}
          className="flex items-center gap-2 text-[10px] font-black text-[#ff0033] bg-red-950/10 px-6 py-3 rounded-xl border border-red-900/20 hover:bg-[#ff0033] hover:text-white transition-all shadow-lg"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />{" "}
          REFRESH CODEBASE
        </button>
      </div>

      {/* 2. SUB-TAB CONTENT */}

      {/* --- 01. CODE SCAN --- */}
      {devTab === "scan" && (
        <div className="space-y-8">
          {/* STAT TILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0c0c0c] border border-zinc-900 p-6 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-[#ff0033]/50 transition-all">
              <div className="p-4 bg-red-950/20 rounded-2xl text-[#ff0033] group-hover:bg-[#ff0033] group-hover:text-white transition-all">
                <Hash size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  Total Lines of Code
                </p>
                <h4 className="text-3xl font-black text-white tracking-tighter">
                  {scanData?.totalLines?.toLocaleString() || 0}
                </h4>
              </div>
            </div>

            <div className="bg-[#0c0c0c] border border-zinc-900 p-6 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-[#ff0033]/50 transition-all">
              <div className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 group-hover:text-[#ff0033] transition-all">
                <FileCode size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  Unique Filetypes
                </p>
                <h4 className="text-3xl font-black text-white tracking-tighter">
                  {scanData?.stats?.length || 0}
                </h4>
              </div>
            </div>
          </div>

          {/* GRAPHS AND LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-zinc-900 h-96 shadow-xl">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase mb-8 tracking-widest flex items-center gap-2">
                <BarChart3 size={14} /> Lines per language
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scanData?.stats || []}>
                  <XAxis
                    dataKey="ext"
                    stroke="#222"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#222"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#111" }}
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid #222",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="lines" radius={[6, 6, 0, 0]}>
                    {(scanData?.stats || []).map((_, i) => (
                      <Cell
                        key={i}
                        fill={i % 2 === 0 ? "#ff0033" : "#660014"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-zinc-900 h-96 overflow-y-auto font-mono text-[10px] custom-scrollbar">
              <div className="text-zinc-500 mb-6 uppercase flex justify-between">
                <span>Inventory Details</span>
                <span className="text-[#ff0033] font-black">Verified</span>
              </div>
              {scanData?.stats?.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-zinc-900/50 pb-2 mb-2 hover:bg-white/5 transition-colors px-1"
                >
                  <span className="text-zinc-400">{s.ext}</span>
                  <span className="text-[#ff0033] font-bold">
                    {s.lines.toLocaleString()} lines
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- 02. LOGIC MAP --- */}
      {devTab === "map" && (
        <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-zinc-900 shadow-xl overflow-x-auto">
          <div className="grid grid-cols-6 text-[9px] font-black uppercase text-zinc-600 mb-8 border-b border-zinc-900 pb-4 min-w-[800px] tracking-widest">
            <div>UI Trigger</div>
            <div>Controller</div>
            <div>Action</div>
            <div>Route</div>
            <div>SQL</div>
            <div>Table</div>
          </div>
          {spellMap?.map((m, i) => (
            <div
              key={i}
              className="grid grid-cols-6 text-[11px] py-5 border-b border-zinc-900 items-center min-w-[800px] hover:bg-white/5 px-2 transition-all"
            >
              <div className="text-zinc-500">{m.UI || m.ui}</div>
              <div className="text-zinc-300 uppercase font-black">
                {m.Controller || m.controller}
              </div>
              <div className="text-white font-mono">{m.Action || m.action}</div>
              <div className="text-zinc-600 font-mono text-[9px] truncate pr-4">
                {m.Route || m.route}
              </div>
              <div className="text-[#ff0033] font-black">{m.SQL || m.sql}</div>
              <div className="text-zinc-400 flex items-center gap-2">
                <Database size={12} /> {m.TargetTable || m.targetTable}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- 03. LIBRARIES --- */}
      {devTab === "ver" && (
        <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-zinc-900 shadow-xl animate-in fade-in duration-500">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-black uppercase text-zinc-600 border-b border-zinc-900 tracking-widest">
                <th className="pb-6">Dependency</th>
                <th className="pb-6">Current</th>
                <th className="pb-6">Target Secure</th>
                <th className="pb-6 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody>
              {versions?.length > 0 ? (
                versions.map((v, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-900/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-5 text-zinc-200 font-bold">
                      {v.library || v.Library}
                    </td>
                    <td className="font-mono text-zinc-400">
                      {v.version || v.Version}
                    </td>
                    <td className="font-mono text-zinc-500">
                      {v.secureVersion || v.SecureVersion}
                    </td>
                    <td className="text-right">
                      <span className="text-green-500 text-[9px] font-black uppercase border border-green-500/20 px-2 py-1 rounded-md bg-green-950/10">
                        {v.status || v.Status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-20 text-center text-zinc-700 italic"
                  >
                    No library data found. Refresh required.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- 04. EXPLORER --- */}
      {devTab === "api" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[650px]">
          <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-zinc-800 flex flex-col overflow-hidden shadow-xl">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase mb-6 tracking-widest">
              Logic Discovery
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
              {Object.entries(groupedApis).map(([ctrl, methods]) => (
                <div key={ctrl} className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Layers size={14} className="text-[#ff0033]" />
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {ctrl} Controller
                    </span>
                  </div>
                  {Array.isArray(methods) &&
                    methods.map((m, i) => {
                      const route = m.Route || m.route;
                      const verb = m.Verb || m.verb || "GET";
                      const action = m.Action || m.action;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setActiveRoute(route);
                            setJsonInput(m.SampleJson || m.sampleJson || "{}");
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${activeRoute === route ? "bg-[#ff0033]/10 border-[#ff0033]" : "bg-black/40 border-zinc-900 hover:border-zinc-700"}`}
                        >
                          <div className="flex flex-col">
                            <span
                              className={`text-[9px] font-black ${verb === "GET" ? "text-blue-500" : "text-green-500"}`}
                            >
                              {verb}
                            </span>
                            <span className="text-xs font-mono text-zinc-200">
                              {action}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              testApi(verb, route);
                            }}
                            className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-[#ff0033] transition-all"
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-zinc-800 flex-1 flex flex-col shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  Payload Editor
                </span>
                <Terminal size={14} className="text-zinc-800" />
              </div>
              <textarea
                className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-green-500 font-mono text-xs flex-1 outline-none focus:border-[#ff0033] transition-all shadow-inner resize-none"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
            </div>
            <div className="bg-black p-8 rounded-3xl border border-zinc-800 h-48 font-mono text-[10px] overflow-auto shadow-2xl relative custom-scrollbar">
              <div className="sticky top-0 bg-black pb-2 text-zinc-700 font-black tracking-widest uppercase mb-2">
                Terminal Output
              </div>
              <pre className="text-green-500 leading-relaxed">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
