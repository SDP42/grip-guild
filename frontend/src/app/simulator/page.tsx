"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { post } from "@/lib/api";
import { Logo } from "@/components/Logo";

type Sim = {
  reachable_shops: number; enrolled: number; active: number; influenced_fitments: number; incremental_tyres: number;
  incremental_revenue_cr: number; gross_profit_cr: number; roi_x: number; cost_per_active_shop_inr: number;
  cost_per_incremental_tyre_inr: number; spend_breakdown_cr: Record<string, number>;
  ramp: { month: number; active: number; fitments: number }[]; assumptions: Record<string, number>;
};

const MIX_C: Record<string, string> = { tools: "#FF5A1F", visibility: "#FFB020", academy: "#C6FF3D", field: "#38BDF8", digital: "#A78BFA" };
const MIX_L: Record<string, string> = { tools: "Tools & equipment", visibility: "Visibility & boards", academy: "Academy", field: "Field force", digital: "Bot, data & tech" };

function Range({ label, value, min, max, step, fmt, onChange }: { label: string; value: number; min: number; max: number; step: number; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm"><span className="text-bone-dim">{label}</span><span className="font-mono">{fmt(value)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-2 w-full accent-[#FF5A1F]" />
    </label>
  );
}

export default function Simulator() {
  const [budget, setBudget] = useState(25);
  const [districts, setDistricts] = useState(120);
  const [mix, setMix] = useState({ tools: 40, visibility: 22, academy: 10, field: 18, digital: 10 });
  const [incr, setIncr] = useState(0.38);
  const [sim, setSim] = useState<Sim | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      post<Sim>("/api/simulate", { budget_cr: budget, districts, months: 12, mix, assumptions: { incrementality: incr } }).then(setSim).catch(() => {});
    }, 120);
    return () => clearTimeout(t);
  }, [budget, districts, mix, incr]);

  const cashMode = () => setMix({ tools: 5, visibility: 5, academy: 0, field: 15, digital: 75 });

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Link href="/"><Logo className="text-lg" /></Link>
        <Link href="/command" className="btn-ghost">Command Centre</Link>
      </header>
      <p className="eyebrow mt-10">National rollout simulator</p>
      <h1 className="h-display mt-2 text-4xl sm:text-6xl">Scale the Guild<span className="text-molten">.</span></h1>
      <p className="mt-3 max-w-2xl text-bone-dim">Move the levers. Every output is computed by the FastAPI model and every assumption is shown, so it can be challenged.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="card space-y-6 p-6">
          <Range label="Annual budget" value={budget} min={5} max={60} step={1} fmt={(v) => `₹${v} Cr`} onChange={setBudget} />
          <Range label="Districts covered" value={districts} min={10} max={600} step={10} fmt={(v) => `${v}`} onChange={setDistricts} />
          <Range label="Incrementality" value={incr} min={0.1} max={0.6} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} onChange={setIncr} />
          <div>
            <p className="mb-3 text-sm text-bone-dim">Spend mix</p>
            {Object.entries(mix).map(([k, v]) => (
              <label key={k} className="mb-2 flex items-center gap-3 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: MIX_C[k] }} />
                <span className="w-32">{MIX_L[k]}</span>
                <input type="range" min={0} max={80} value={v} onChange={(e) => setMix({ ...mix, [k]: +e.target.value })} className="flex-1" style={{ accentColor: MIX_C[k] }} />
                <span className="w-8 text-right font-mono">{v}</span>
              </label>
            ))}
            <div className="mt-3 flex gap-2">
              <button onClick={() => setMix({ tools: 40, visibility: 22, academy: 10, field: 18, digital: 10 })} className="chip">Guild mix</button>
              <button onClick={cashMode} className="chip">Cash-scheme style</button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {sim && (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Shops enrolled", sim.enrolled.toLocaleString("en-IN")],
                  ["Active shops", sim.active.toLocaleString("en-IN")],
                  ["Incremental tyres", sim.incremental_tyres.toLocaleString("en-IN")],
                  ["Incremental revenue", `₹${sim.incremental_revenue_cr} Cr`],
                  ["Gross profit ROI", `${sim.roi_x}×`],
                  ["Cost / active shop", `₹${sim.cost_per_active_shop_inr.toLocaleString("en-IN")}`],
                  ["Cost / extra tyre", `₹${sim.cost_per_incremental_tyre_inr}`],
                  ["Reachable shops", sim.reachable_shops.toLocaleString("en-IN")],
                ].map(([l, v]) => (
                  <motion.div key={l} layout className="card p-4">
                    <motion.p key={v} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-black">{v}</motion.p>
                    <p className="mt-1 text-[11px] text-bone-mute">{l}</p>
                  </motion.div>
                ))}
              </div>
              <div className="card p-5">
                <p className="text-sm font-semibold">12-month ramp · active shops</p>
                <div className="mt-3 h-56">
                  <ResponsiveContainer>
                    <AreaChart data={sim.ramp} margin={{ left: 0, right: 8 }}>
                      <defs><linearGradient id="rp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF5A1F" stopOpacity={0.5} /><stop offset="1" stopColor="#FF5A1F" stopOpacity={0} /></linearGradient></defs>
                      <XAxis dataKey="month" tick={{ fill: "#7E838E", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#7E838E", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#101216", border: "1px solid #2C313B", borderRadius: 12 }} />
                      <Area dataKey="active" stroke="#FF5A1F" strokeWidth={2} fill="url(#rp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card p-5">
                <p className="text-sm font-semibold">Where the money goes</p>
                <div className="mt-3 flex h-8 overflow-hidden rounded-lg">
                  {Object.entries(sim.spend_breakdown_cr).map(([k, v]) => (
                    <motion.div key={k} layout style={{ width: `${(v / budget) * 100}%`, background: MIX_C[k] }} title={`${MIX_L[k]} ₹${v} Cr`} />
                  ))}
                </div>
                <p className="mt-4 text-xs text-bone-mute">
                  Assumptions: {sim.assumptions.shops_per_district} reachable shops/district · {Math.round(sim.assumptions.enrol_rate * 100)}% enrol ·
                  {" "}{sim.assumptions.influenced_fitments_pm} influenced fitments/active shop/month · ASP ₹{sim.assumptions.tyre_asp_inr} ·
                  {" "}{Math.round(sim.assumptions.gross_margin * 100)}% gross margin. Planning estimates, not Eurogrip data.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
