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
  const { me } = useMe();
  const [tread, setTread] = useState(2.4);
  const [psi, setPsi] = useState(24);
  const [age, setAge] = useState(30);
  const [pattern, setPattern] = useState("edges");
  const [cracks, setCracks] = useState(false);
  const [res, setRes] = useState<Res | null>(null);

  useEffect(() => {
    const t = setTimeout(() => post<Res>("/api/treadlens", { tread_mm: tread, psi, recommended_psi: 29, age_months: age, pattern, cracks }).then(setRes), 150);
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
          <button className="btn-primary mt-4 w-full"><Share2 className="h-4 w-4" /> Send card to rider on WhatsApp</button>
        </motion.div>
      )}
    </div>
  );
}
