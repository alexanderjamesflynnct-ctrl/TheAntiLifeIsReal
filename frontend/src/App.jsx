import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { History, Mic2, Skull, Code } from "lucide-react";

// Sub-Components
import { TabBtn } from "./components/Common";
import Studio from "./components/Studio";
import Vault from "./components/Vault";
import SpellMap from "./components/SpellMap";

const API_BASE = "http://localhost:5135/api/voice";
const DEV_BASE = "http://localhost:5135/api/developer";

export default function App() {
  const [tab, setTab] = useState("gen");
  const [devTab, setDevTab] = useState("scan");

  // States
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [spellMap, setSpellMap] = useState([]);
  const [versions, setVersions] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [jsonInput, setJsonInput] = useState("{}");

  const [sets, setSets] = useState({
    text: "Demonic Voices are hot",
    voice: "en-US-EmmaNeural", // Updated
    edgePitch: -30,
    edgeRate: -25, // Updated
    shiftMain: -0.06, // Updated
    shiftHarmony: -0.51, // Updated
    shiftSub: -1.0,
    subGain: -12,
    harmonyGain: -7,
    delayMs: 0,
    lowPass: 2500,
    echoDelay: 110, // Updated
    echoDecay: 10,
    fileNameBase: "demonic_gen",
  });

  const lastSavedSettings = useRef(null);

  const groupedApis = useMemo(() => {
    if (!spellMap || !Array.isArray(spellMap)) return {};
    return spellMap.reduce((acc, curr) => {
      const ctrl = curr.Controller || curr.controller || "System";
      if (!acc[ctrl]) acc[ctrl] = [];
      acc[ctrl].push(curr);
      return acc;
    }, {});
  }, [spellMap]);

  useEffect(() => {
    loadCore();
  }, []);
  useEffect(() => {
    if (tab === "dev") loadDev();
  }, [tab]);

  const loadCore = async () => {
    setLoadingVoices(true);
    setLoadingHistory(true);
    try {
      const v = await axios.get(`${API_BASE}/list`);
      setVoices(v.data);
      setLoadingVoices(false);
      const h = await axios.get(`${API_BASE}/history`);
      setHistory(h.data);
      setLoadingHistory(false);
    } catch (e) {
      setLoadingVoices(false);
      setLoadingHistory(false);
    }
  };

  const loadDev = async () => {
    try {
      const s = await axios.get(`${DEV_BASE}/scan`);
      setScanData(s.data);
      const m = await axios.get(`${DEV_BASE}/spell-map`);
      setSpellMap(m.data);
      const v = await axios.get(`${DEV_BASE}/versions`);
      setVersions(v.data);
    } catch (e) {
      console.error("Dev load failed");
    }
  };

  const syncArchive = async () => {
    setLoading(true);
    try {
      await axios.post(`${DEV_BASE}/refresh`);
      await loadDev();
      alert("Archives synchronized.");
    } catch (e) {
      alert("Sync failed.");
    }
    setLoading(false);
  };

  const manifest = async () => {
    const currentJson = JSON.stringify({ ...sets, fileNameBase: "" });
    const lastJson = JSON.stringify({
      ...lastSavedSettings.current,
      fileNameBase: "",
    });
    if (currentJson === lastJson && audioUrl) {
      document.getElementById("studioPlayer")?.play();
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate`, sets);
      setAudioUrl(`http://localhost:5135${res.data.url}`);
      lastSavedSettings.current = { ...sets };
      const h = await axios.get(`${API_BASE}/history`);
      setHistory(h.data);
    } catch (err) {
      alert("Manifestation failed.");
    }
    setLoading(false);
  };

  const deleteItem = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Banish?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/history/${id}`);
      const h = await axios.get(`${API_BASE}/history`);
      setHistory(h.data);
    } catch (e) {
      alert("Delete failed");
    }
    setDeletingId(null);
  };

  const zapToStudio = (item) => {
    const loaded = {
      ...sets,
      text: item.Text || item.text,
      voice: item.Voice || item.voice,
      edgePitch: item.EdgePitch || item.edgePitch || -30,
      edgeRate: item.EdgeRate || item.edgeRate,
      shiftMain: item.ShiftMain || item.shiftMain,
      shiftHarmony: item.ShiftHarmony || item.shiftHarmony,
      shiftSub: item.ShiftSub || item.shiftSub || -1.0,
      subGain: item.SubGain || item.subGain || -12,
      harmonyGain: item.HarmonyGain || item.harmonyGain || -7,
      delayMs: item.DelayMs || item.delayMs || 0,
      lowPass: item.LowPass || item.lowPass || 2500,
      echoDelay: item.EchoDelay || item.echoDelay || 0,
      echoDecay: item.EchoDecay || item.echoDecay || 10,
    };

    setSets(loaded);
    lastSavedSettings.current = { ...loaded }; // Prevent immediate resave on load
    setTab("gen"); // Switch to Studio
    window.scrollTo(0, 0);
  };

  const testApi = async (verb, route) => {
    setApiResponse("Manifesting response...");
    try {
      const cleanRoute = route.replace("{id}", "1");
      const url = `http://localhost:5135${cleanRoute.startsWith("/") ? "" : "/"}${cleanRoute}`;
      let res;
      if (verb === "POST") res = await axios.post(url, JSON.parse(jsonInput));
      else if (verb === "DELETE") res = await axios.delete(url);
      else res = await axios.get(url);
      setApiResponse(res.data);
    } catch (e) {
      setApiResponse({ error: "Void Interrupted", message: e.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-[#ff0033]/30 pb-20">
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skull className="text-[#ff0033]" />
            <h1 className="text-white font-black tracking-tighter uppercase text-lg">
              Demonic Voices
            </h1>
          </div>
          <nav className="flex gap-1 bg-zinc-900 p-1 rounded-xl">
            <TabBtn
              active={tab === "gen"}
              onClick={() => setTab("gen")}
              icon={<Mic2 size={14} />}
              label="Studio"
            />
            <TabBtn
              active={tab === "vault"}
              onClick={() => setTab("vault")}
              icon={<History size={14} />}
              label="Vault"
            />
            <TabBtn
              active={tab === "dev"}
              onClick={() => setTab("dev")}
              icon={<Code size={14} />}
              label="Spell Map"
            />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-4">
        {tab === "gen" && (
          <Studio
            voices={voices}
            loadingVoices={loadingVoices}
            sets={sets}
            setSets={setSets}
            manifest={manifest}
            loading={loading}
            audioUrl={audioUrl}
          />
        )}
        {tab === "vault" && (
          <Vault
            history={history}
            loadingHistory={loadingHistory}
            deletingId={deletingId}
            zapToStudio={zapToStudio}
            deleteItem={deleteItem}
          />
        )}
        {tab === "dev" && (
          <SpellMap
            devTab={devTab}
            setDevTab={setDevTab}
            syncArchive={syncArchive}
            loading={loading}
            scanData={scanData}
            spellMap={spellMap}
            versions={versions}
            groupedApis={groupedApis}
            activeRoute={activeRoute}
            setActiveRoute={setActiveRoute}
            jsonInput={jsonInput}
            setJsonInput={setJsonInput}
            testApi={testApi}
            apiResponse={apiResponse}
          />
        )}
      </main>
    </div>
  );
}
