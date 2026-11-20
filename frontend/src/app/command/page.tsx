"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Gauge, Network, Sparkles, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import CountUp from "@/components/CountUp";

type Overview = Record<string, number> & { tier_mix: Record<string, number> };
type Week = { label: string; stock: number; ghost_shelf: number; referral: number; redeemed: number };
type Stage = { stage: string; value: number };
type District = { id: number; name: string; state: string; lat: number; lng: number; cohort: string; baseline_share: number; current_share: number; mechanics: number };
type Lift = { pilot_delta_pp: number; control_delta_pp: number; incremental_lift_pp: number; method: string };
type Infl = { id: number; shop: string; district: string; redeemed: number; issued: number; conversion_pct: number; stocks_eurogrip: boolean; tier: string };
type Fraud = { id: number; shop: string; kind: string; detail: string; severity: string; resolved: boolean };
type Auto = { district: string; lift_pp: number; mechanics: number; current_lakh: number; next_lakh: number; change_pct: number };

const TT = { contentStyle: { background: "#101216", border: "1px solid #2C313B", borderRadius: 12, fontSize: 12 } };
const SEV = { high: "#F43F5E", medium: "#FFB020", low: "#7E838E" } as Record<string, string>;

function Panel({ title, icon: Icon, children, className = "", right }: { title: string; icon: typeof Activity; children: React.ReactNode; className?: string; right?: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-molten" /> {title}</p>
        {right}
      </div>
      {children}
    </motion.section>
  );
}

function DistrictMap({ ds }: { ds: District[] }) {
  // Equirectangular projection over India's bounding box.
  const x = (lng: number) => ((lng - 68) / (97.5 - 68)) * 100;
  const y = (lat: number) => ((36 - lat) / (36 - 7)) * 100;
  return (
    <div className="relative aspect-[1/1.05] w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_40%,#141820,#07080A)]">
      <div className="tread-bg absolute inset-0 opacity-30" />
      {ds.map((d, i) => {
        const lift = d.current_share - d.baseline_share;
        const pilot = d.cohort === "pilot";
        const size = 10 + d.mechanics * 0.9;
        return (
          <motion.div key={d.id} initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
            className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x(d.lng)}%`, top: `${y(d.lat)}%` }}>
            <span className="block rounded-full" style={{ width: size, height: size, background: pilot ? "#C6FF3D" : "#7E838E", opacity: 0.25 + Math.min(0.7, lift / 6),
              boxShadow: pilot ? `0 0 ${8 + lift * 4}px #C6FF3D` : "none" }} />
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-ink px-2 py-1 text-[10px] group-hover:block">
              <b>{d.name}</b> · {d.cohort} · +{lift.toFixed(1)} pp · {d.mechanics} shops
            </span>
          </motion.div>
        );
      })}
      <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] text-bone-dim">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-volt" /> Pilot</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-bone-mute" /> Control</span>
        <span>Size = shops · glow = share lift</span>
      </div>
    </div>
  );
}

export default function Command() {
  const [o, setO] = useState<Overview | null>(null);
  const [ts, setTs] = useState<Week[]>([]);
  const [funnel, setFunnel] = useState<Stage[]>([]);
  const [ds, setDs] = useState<District[]>([]);
  const [lift, setLift] = useState<Lift | null>(null);
  const [infl, setInfl] = useState<Infl[]>([]);
  const [fraud, setFraud] = useState<Fraud[]>([]);
  const [auto, setAuto] = useState<Auto[]>([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Overview>("/api/analytics/overview").then(setO),
      api<Week[]>("/api/analytics/timeseries").then(setTs),
      api<Stage[]>("/api/analytics/funnel").then(setFunnel),
      api<{ districts: District[] }>("/api/analytics/map").then((m) => setDs(m.districts)),
      api<Lift>("/api/analytics/lift").then(setLift),
      api<Infl[]>("/api/analytics/influence").then(setInfl),
      api<Fraud[]>("/api/analytics/fraud").then(setFraud),
      api<Auto[]>("/api/analytics/autopilot").then(setAuto),
    ]).catch(() => setErr(true));
  }, []);

  const kpis = o ? [
    ["Guild shops", o.mechanics], ["Active (30d)", o.active_30d], ["Verified fitments", o.fitments],
    ["Referral → sale %", o.referral_conversion_pct], ["Non-stock advocates", o.non_stock_advocates], ["Tools leased", o.tools_leased],
    ["Boomerangs due (90d)", o.boomerang_due_90d], ["Open fraud alerts", o.open_fraud_alerts],
  ] as [string, number][] : [];

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href="/"><Logo className="text-lg" /></Link>
          <span className="chip">Command Centre · Brand Manager</span>
        </div>
        <div className="flex gap-2">
          <Link href="/simulator" className="btn-ghost">Rollout simulator</Link>
          <Link href="/personas" className="btn-ghost">Personas</Link>
        </div>
      </header>
      {err && <p className="mt-4 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm text-rose">Backend offline — start the FastAPI server to load live data.</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {kpis.map(([l, v], i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-4">
            <p className="font-display text-2xl font-black"><CountUp to={v} /></p>
            <p className="mt-1 text-[11px] text-bone-mute">{l}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Verified Eurogrip fitments by channel (weekly)" icon={Activity} className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={ts} margin={{ left: -18, right: 8 }}>
                <defs>
                  {[["s", "#FF5A1F"], ["g", "#FFB020"], ["r", "#C6FF3D"]].map(([k, c]) => (
                    <linearGradient key={k} id={`c${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity={0.55} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="#1b1f26" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#7E838E", fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: "#7E838E", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...TT} />
                <Area type="monotone" dataKey="stock" name="Stocked" stackId="1" stroke="#FF5A1F" fill="url(#cs)" />
                <Area type="monotone" dataKey="ghost_shelf" name="Ghost Shelf" stackId="1" stroke="#FFB020" fill="url(#cg)" />
                <Area type="monotone" dataKey="referral" name="Referral" stackId="1" stroke="#C6FF3D" fill="url(#cr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-bone-mute">Ghost Shelf + referral = Eurogrip sales from shops that don&apos;t stock Eurogrip — the brief&apos;s &quot;influence without inventory&quot;.</p>
        </Panel>

        <Panel title="Advocacy funnel" icon={Users}>
          <div className="space-y-3">
            {funnel.map((f, i) => {
              const pct = (100 * f.value) / (funnel[0]?.value || 1);
              return (
                <div key={f.stage}>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-bone-dim">{f.stage}</span><span className="font-mono">{f.value.toLocaleString("en-IN")}</span></div>
                  <div className="h-7 overflow-hidden rounded-lg bg-ink-700">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-lg" style={{ background: `linear-gradient(90deg, #FF5A1F, ${["#FF5A1F", "#FF7A45", "#FFB020", "#C6FF3D", "#C6FF3D"][i]})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="District constellation" icon={Sparkles}><DistrictMap ds={ds} /></Panel>

        <Panel title="Lift Engine" icon={Gauge}>
          {lift && (
            <>
              <p className="font-display text-5xl font-black text-volt">+<CountUp to={lift.incremental_lift_pp} decimals={2} /> pp</p>
              <p className="text-xs text-bone-dim">Incremental replacement share vs matched control districts</p>
              <div className="mt-5 h-44">
                <ResponsiveContainer>
                  <BarChart data={ds.filter((d) => d.cohort === "pilot").map((d) => ({ n: d.name, v: +(d.current_share - d.baseline_share).toFixed(2) })).sort((a, b) => b.v - a.v)} margin={{ left: -24 }}>
                    <XAxis dataKey="n" tick={{ fill: "#7E838E", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
                    <YAxis tick={{ fill: "#7E838E", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TT} />
                    <Bar dataKey="v" name="Share lift (pp)" radius={[4, 4, 0, 0]}>
                      {ds.filter((d) => d.cohort === "pilot").map((d) => <Cell key={d.id} fill="#C6FF3D" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-[11px] text-bone-mute">{lift.method}. Pilot +{lift.pilot_delta_pp} pp vs control +{lift.control_delta_pp} pp.</p>
            </>
          )}
        </Panel>

        <Panel title="Budget Autopilot · next month" icon={Gauge} right={<span className="font-mono text-[10px] text-bone-mute">₹60 L / month</span>}>
          <ul className="space-y-1.5">
            {auto.slice(0, 9).map((a) => (
              <li key={a.district} className="flex items-center gap-3 text-xs">
                <span className="w-24 truncate">{a.district}</span>
                <div className="relative h-2 flex-1 rounded-full bg-ink-700">
                  <motion.span initial={{ width: 0 }} whileInView={{ width: `${(a.next_lakh / 6) * 100}%` }} viewport={{ once: true }}
                    className="absolute inset-y-0 left-0 rounded-full" style={{ background: a.change_pct >= 0 ? "#C6FF3D" : "#F43F5E" }} />
                </div>
                <span className={`w-12 text-right font-mono ${a.change_pct >= 0 ? "text-volt" : "text-rose"}`}>{a.change_pct > 0 ? "+" : ""}{a.change_pct}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-bone-mute">Spend follows measured lift × active shops, capped at ±25% a month so field teams can plan.</p>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Influence Graph · whose word sells tyres" icon={Network}>
          <ul className="divide-y divide-white/5">
            {infl.slice(0, 8).map((m, i) => (
              <li key={m.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-5 font-mono text-xs text-bone-mute">{i + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate">{m.shop}</p><p className="text-[11px] text-bone-mute">{m.district} · {m.tier}</p></div>
                {!m.stocks_eurogrip && <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] text-amber">no stock</span>}
                <span className="w-20 text-right font-mono text-xs">{m.redeemed} sales</span>
                <span className="w-12 text-right font-mono text-xs text-volt">{m.conversion_pct}%</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Fraud Guard" icon={AlertTriangle} right={<span className="font-mono text-[10px] text-bone-mute">{fraud.filter((f) => !f.resolved).length} open</span>}>
          <ul className="space-y-1.5">
            {fraud.slice(0, 8).map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-xl bg-ink-700 px-3 py-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SEV[f.severity] }} />
                <span className="w-28 truncate font-semibold">{f.shop}</span>
                <span className="min-w-0 flex-1 truncate text-bone-dim">{f.detail}</span>
                <span className={f.resolved ? "text-bone-mute" : "text-rose"}>{f.resolved ? "resolved" : "open"}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </main>
  );
}
