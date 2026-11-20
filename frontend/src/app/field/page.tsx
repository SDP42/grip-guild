"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CalendarCheck, CheckCircle2, MapPin } from "lucide-react";
import { api, post } from "@/lib/api";
import PersonaHeader from "@/components/PersonaHeader";

type Nudge = { id: number; shop: string; name: string; district: string; tier: string; last30: number; prev30: number;
  risk: number; level: "high" | "medium" | "low"; reasons: string[]; action: string };
type Visit = { id: number; shop: string; purpose: string; status: string; scheduled_for: string; officer: string };

const LEVEL_C = { high: "#F43F5E", medium: "#FFB020", low: "#7E838E" };

export default function Field() {
  const [data, setData] = useState<{ total_at_risk: number; items: Nudge[] } | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    api<{ total_at_risk: number; items: Nudge[] }>("/api/field/nudges").then(setData);
    api<Visit[]>("/api/field/visits").then((v) => setVisits(v.filter((x) => x.status === "planned").slice(0, 8)));
  }, []);

  async function act(n: Nudge) {
    await post("/api/field/visits", { mechanic_id: n.id, purpose: "nudge", notes: n.action });
    setDone((d) => new Set(d).add(n.id));
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <PersonaHeader initials="AD" color="#F43F5E" kind="Field officer" name="Anita Desai" sub="Eurogrip field officer · 140 shops · Pune West cluster" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow !text-rose">Nudge Engine</p>
              <h2 className="font-display text-2xl font-bold">Who needs you today</h2>
            </div>
            {data && <span className="chip !text-rose"><AlertTriangle className="h-3.5 w-3.5" /> {data.total_at_risk} shops at risk</span>}
          </div>
          <p className="mt-1 text-sm text-bone-dim">Ranked by churn risk: falling fitments, broken streaks, stalled tool EMIs, unredeemed referrals.</p>
          <ul className="mt-5 space-y-3">
            {data?.items.map((n, i) => (
              <motion.li key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="card relative overflow-hidden p-4">
                <span className="absolute inset-y-0 left-0 w-1" style={{ background: LEVEL_C[n.level] }} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{n.shop} <span className="text-xs text-bone-mute">· {n.name} · {n.district} · {n.tier}</span></p>
                    <ul className="mt-1.5 space-y-0.5 text-xs text-bone-dim">{n.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-black" style={{ color: LEVEL_C[n.level] }}>{Math.round(n.risk * 100)}</p>
                    <p className="text-[10px] uppercase tracking-widest text-bone-mute">risk</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-700 px-3 py-2 text-xs">
                  <span>➜ {n.action}</span>
                  <AnimatePresence mode="wait">
                    {done.has(n.id) ? (
                      <motion.span key="d" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-volt"><CheckCircle2 className="h-4 w-4" /> Logged</motion.span>
                    ) : (
                      <button onClick={() => act(n)} className="rounded-lg bg-rose/20 px-2.5 py-1 font-semibold text-rose">Do it</button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="flex items-center gap-2 font-semibold"><CalendarCheck className="h-5 w-5 text-sky" /> Planned visits</p>
            <ul className="mt-3 space-y-2">
              {visits.map((v) => (
                <li key={v.id} className="flex items-center gap-3 rounded-xl bg-ink-700 px-3 py-2 text-sm">
                  <MapPin className="h-4 w-4 text-molten" />
                  <div className="min-w-0 flex-1"><p className="truncate">{v.shop}</p><p className="text-[11px] capitalize text-bone-mute">{v.purpose.replace("_", " ")} · {v.officer}</p></div>
                  <span className="font-mono text-[11px] text-bone-dim">{new Date(v.scheduled_for).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5 text-sm text-bone-dim">
            <p className="font-semibold text-bone">Why a field app?</p>
            <p className="mt-2">India&apos;s mechanic network is too fragmented for blanket visits. The Nudge Engine sends limited field hours to the shops about to drift — the cheapest way to keep advocacy alive after sign-up.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
