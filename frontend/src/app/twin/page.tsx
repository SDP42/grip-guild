"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BadgeCheck, CalendarClock, Layers, ShieldAlert, Thermometer } from "lucide-react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { TWIN_LAYERS, type WearPattern } from "@/components/three/TyreTwin";

const TyreTwin = dynamic(() => import("@/components/three/TyreTwin"), { ssr: false });

type Twin = {
  genuine: boolean; message?: string; serial: string; model: string; vehicle: string; fitted_by: string; mechanic_tier: string;
  fitted_on: string; warranty_until: string; next_check_due: string; tread_now_mm: number;
  history: { date: string; tread_mm: number; event: string }[];
};

const PATTERNS: [WearPattern, string][] = [["even", "Even"], ["center", "Over-inflated"], ["edges", "Under-inflated"], ["one_side", "Misaligned"], ["cupping", "Unbalanced"]];
const d = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function TwinView() {
  const params = useSearchParams();
  const [twin, setTwin] = useState<Twin | null>(null);
  const [serial, setSerial] = useState(params.get("serial") ?? "");
  const [exploded, setExploded] = useState(0);
  const [heatmap, setHeatmap] = useState(true);
  const [pattern, setPattern] = useState<WearPattern>("edges");

  async function load(s: string) {
    setTwin(await api<Twin>(`/api/rider/tyre/${s}`));
  }
  useEffect(() => {
    (async () => {
      const s = params.get("serial") ?? (await api<{ serial: string }>("/api/rider/sample-serial")).serial;
      setSerial(s); load(s);
    })().catch(() => {});
  }, [params]);

  const wear = twin?.genuine ? Math.min(0.95, Math.max(0.05, 1 - (twin.tread_now_mm - 1.6) / (6 - 1.6))) : 0.4;
  const chart = twin?.history.map((h) => ({ date: d(h.date), tread: h.tread_mm })) ?? [];

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/"><Logo className="text-lg" /></Link>
        <Link href="/personas" className="btn-ghost">Personas</Link>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="card relative h-[460px] overflow-hidden sm:h-[620px]">
          <div className="absolute left-5 top-5 z-10">
            <p className="eyebrow">Tyre Twin · 3D</p>
            <p className="font-mono text-xs text-bone-mute">{twin?.serial ?? "loading…"} · drag to orbit</p>
          </div>
          <TyreTwin wear={wear} pattern={pattern} exploded={exploded} heatmap={heatmap} />
          <ul className={`absolute right-5 top-5 z-10 space-y-1.5 transition-opacity duration-500 ${exploded > 0.4 ? "opacity-100" : "opacity-0"}`}>
            {TWIN_LAYERS.map((l, i) => (
              <li key={l.name} className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink/70 px-2.5 py-1.5 text-[11px] backdrop-blur">
                <span className="font-mono text-bone-mute">0{i + 1}</span>
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                <span className="font-semibold">{l.name}</span>
                <span className="hidden text-bone-mute sm:inline">· {l.detail}</span>
              </li>
            ))}
          </ul>
          <div className="absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-white/10 bg-ink/70 p-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex min-w-[200px] flex-1 items-center gap-3 text-xs">
                <Layers className="h-4 w-4 text-molten" /> Exploded view
                <input type="range" min={0} max={1} step={0.01} value={exploded} onChange={(e) => setExploded(+e.target.value)} className="flex-1 accent-[#FF5A1F]" />
              </label>
              <button onClick={() => setHeatmap(!heatmap)} className={`chip ${heatmap ? "!border-volt !text-volt" : ""}`}><Thermometer className="h-3.5 w-3.5" /> Wear heatmap</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PATTERNS.map(([k, l]) => <button key={k} onClick={() => setPattern(k)} className={`chip ${pattern === k ? "!border-molten !text-molten" : ""}`}>{l}</button>)}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); load(serial); }} className="flex gap-2">
            <input value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 font-mono text-sm outline-none focus:border-molten" placeholder="Scan or type tyre serial" />
            <button className="btn-primary">Check</button>
          </form>

          {twin && !twin.genuine && (
            <div className="card flex gap-3 border-rose/40 p-5"><ShieldAlert className="h-6 w-6 shrink-0 text-rose" /><p className="text-sm">{twin.message}</p></div>
          )}
          {twin?.genuine && (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                <div className="flex items-center gap-2 text-volt"><BadgeCheck className="h-5 w-5" /><span className="text-sm font-semibold">Genuine Eurogrip tyre</span></div>
                <p className="mt-3 font-display text-2xl font-bold">{twin.model}</p>
                <p className="text-sm text-bone-dim">{twin.vehicle} · fitted by {twin.fitted_by} ({twin.mechanic_tier})</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-ink-700 p-3"><p className="font-display text-xl font-black">{twin.tread_now_mm} mm</p><p className="text-[10px] text-bone-mute">Tread now</p></div>
                  <div className="rounded-xl bg-ink-700 p-3"><p className="font-display text-xl font-black">{Math.round(wear * 100)}%</p><p className="text-[10px] text-bone-mute">Worn</p></div>
                  <div className="rounded-xl bg-ink-700 p-3"><p className="font-display text-xl font-black">{twin.history.length - 1}</p><p className="text-[10px] text-bone-mute">Checks</p></div>
                </div>
              </motion.div>
              <div className="card p-5">
                <p className="text-sm font-semibold">Tread depth over time</p>
                <div className="mt-3 h-40">
                  <ResponsiveContainer>
                    <AreaChart data={chart} margin={{ left: -24, right: 8 }}>
                      <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF5A1F" stopOpacity={0.5} /><stop offset="1" stopColor="#FF5A1F" stopOpacity={0} /></linearGradient></defs>
                      <XAxis dataKey="date" tick={{ fill: "#7E838E", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 6.5]} tick={{ fill: "#7E838E", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#101216", border: "1px solid #2C313B", borderRadius: 12 }} />
                      <ReferenceLine y={1.6} stroke="#F43F5E" strokeDasharray="4 4" label={{ value: "Legal min 1.6", fill: "#F43F5E", fontSize: 10, position: "insideTopRight" }} />
                      <Area type="monotone" dataKey="tread" stroke="#FF5A1F" strokeWidth={2} fill="url(#tg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card space-y-2 p-5 text-sm">
                <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-sky" /> Next check due {d(twin.next_check_due)} at {twin.fitted_by}</p>
                <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-amber" /> Warranty valid until {d(twin.warranty_until)}</p>
              </div>
            </>
          )}
          <p className="text-xs text-bone-mute">Why it matters: Eurogrip sells through dealers and mechanics, so it rarely knows who rides its tyres. Every Guild fitment creates a twin, which gives Eurogrip first-party wear data, a counterfeit check and a reason for the rider to come back to the same mechanic.</p>
        </section>
      </div>
    </main>
  );
}

export default function TwinPage() {
  return <Suspense><TwinView /></Suspense>;
}
