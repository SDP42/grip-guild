"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";

type Res = { score: number; verdict: string; color: "red" | "amber" | "green"; pattern: string; km_left_estimate: number;
  wet_grip_pct: number; findings: string[]; recommendation: string | null };

const PATTERNS = [["even", "Even"], ["center", "Centre"], ["edges", "Edges"], ["cupping", "Cupping"], ["one_side", "One side"]];
const COL = { red: "#F43F5E", amber: "#FFB020", green: "#C6FF3D" };

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex justify-between text-xs"><span className="text-bone-dim">{label}</span><span className="font-mono">{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-1 w-full accent-[#FF5A1F]" />
    </label>
  );
}

export default function TreadLens() {
  const { me, refresh } = useMe();
  const [tread, setTread] = useState(2.4);
  const [psi, setPsi] = useState(24);
  const [age, setAge] = useState(30);
  const [pattern, setPattern] = useState("edges");
  const [cracks, setCracks] = useState(false);
  const [res, setRes] = useState<Res | null>(null);
  const [rider, setRider] = useState("Priya");
  const [saved, setSaved] = useState<{ card_id: number; whatsapp: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveAndShare() {
    if (!me) return;
    setSaving(true);
    const r = await post<{ card_id: number; whatsapp: string; share_text: string }>("/api/treadlens/save", {
      mechanic_id: me.mechanic.id, rider_name: rider || "Rider", tread_mm: tread, psi, recommended_psi: 29, age_months: age, pattern, cracks,
    });
    const text = r.share_text.replace(`/card/${r.card_id}`, `${window.location.origin}/card/${r.card_id}`);
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    setSaved({ card_id: r.card_id, whatsapp: wa }); setSaving(false); refresh();
    window.open(wa, "_blank", "noopener");
  }

  useEffect(() => {
    const t = setTimeout(() => post<Res>("/api/treadlens", { tread_mm: tread, psi, recommended_psi: 29, age_months: age, pattern, cracks }).then(setRes), 150);
    setSaved(null);
    return () => clearTimeout(t);
  }, [tread, psi, age, pattern, cracks]);

  const c = res ? COL[res.color] : "#7E838E";
  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">TreadLens</h1>
      <p className="text-sm text-bone-dim">A 20-second check that becomes a health card on the rider&apos;s WhatsApp — with your shop&apos;s name on it.</p>

      <div className="card mt-4 space-y-4 p-4">
        <Slider label="Tread depth" value={tread} min={0.8} max={6} step={0.1} unit=" mm" onChange={setTread} />
        <Slider label="Pressure (spec 29)" value={psi} min={14} max={40} step={1} unit=" psi" onChange={setPsi} />
        <Slider label="Tyre age" value={age} min={1} max={72} step={1} unit=" mo" onChange={setAge} />
        <div className="flex flex-wrap gap-1.5">
          {PATTERNS.map(([k, l]) => <button key={k} onClick={() => setPattern(k)} className={`chip ${pattern === k ? "!border-molten !text-molten" : ""}`}>{l}</button>)}
          <button onClick={() => setCracks(!cracks)} className={`chip ${cracks ? "!border-rose !text-rose" : ""}`}>Sidewall cracks</button>
        </div>
      </div>

      {res && (
        <motion.div layout className="relative mt-4 overflow-hidden rounded-3xl border p-5" style={{ borderColor: `${c}55`, background: `linear-gradient(160deg, ${c}1a, #101216 60%)` }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-mute">Tyre health card · {me?.mechanic.shop_name}</p>
          <div className="mt-3 flex items-center gap-5">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="42" stroke="#20242C" strokeWidth="10" fill="none" />
                <motion.circle cx="50" cy="50" r="42" stroke={c} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={264}
                  animate={{ strokeDashoffset: 264 * (1 - res.score / 100) }} transition={{ type: "spring", stiffness: 60 }} />
              </svg>
              <p className="absolute inset-0 grid place-items-center font-display text-2xl font-black">{res.score}</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold" style={{ color: c }}>{res.verdict}</p>
              <p className="text-xs text-bone-dim">{res.pattern} · ~{res.km_left_estimate.toLocaleString("en-IN")} km left</p>
              <p className="text-xs text-bone-dim">Wet grip {res.wet_grip_pct}%</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1 text-sm">{res.findings.map((f) => <li key={f}>• {f}</li>)}</ul>
          {res.recommendation && <p className="mt-3 rounded-xl bg-ink/60 p-3 text-sm">Recommended: <b className="text-molten">{res.recommendation}</b> — fit at {me?.mechanic.shop_name}</p>}
          <label className="mt-4 block text-xs text-bone-dim">Rider name
            <input value={rider} onChange={(e) => setRider(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-sm text-bone outline-none focus:border-molten" />
          </label>
          {saved ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="rounded-xl bg-volt/10 p-3">✅ Saved to the tyre&apos;s Twin and counted toward your Monsoon quest.</p>
              <div className="flex gap-2">
                <a href={`/card/${saved.card_id}`} target="_blank" className="btn-ghost flex-1">View card</a>
                <a href={saved.whatsapp} target="_blank" rel="noopener" className="btn flex-1 bg-[#25D366] text-ink">WhatsApp again</a>
              </div>
            </div>
          ) : (
            <button onClick={saveAndShare} disabled={saving} className="btn-primary mt-3 w-full"><Share2 className="h-4 w-4" /> {saving ? "Saving…" : "Save & send card on WhatsApp"}</button>
          )}
        </motion.div>
      )}
    </div>
  );
}
