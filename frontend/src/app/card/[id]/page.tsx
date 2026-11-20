"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";

type Card = { id: number; serial: string; tread_mm: number; psi: number; rider: string; created_at: string; shop: string; mechanic_id: number;
  tier: string; rating: number; score: number; verdict: string; color: "red" | "amber" | "green"; pattern: string; km_left_estimate: number;
  wet_grip_pct: number; findings: string[]; recommendation: string | null };
const COL = { red: "#F43F5E", amber: "#FFB020", green: "#C6FF3D" };

export default function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [c, setC] = useState<Card | null>(null);
  useEffect(() => { api<Card>(`/api/cards/${id}`).then(setC).catch(() => {}); }, [id]);
  if (!c) return <main className="grid min-h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-molten border-t-transparent" /></main>;
  const col = COL[c.color];

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <Logo className="text-base" />
      <motion.section initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 overflow-hidden rounded-3xl border p-6" style={{ borderColor: `${col}55`, background: `linear-gradient(160deg, ${col}22, #101216 60%)` }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-mute">Tyre health card · for {c.rider}</p>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="-rotate-90"><circle cx="50" cy="50" r="42" stroke="#20242C" strokeWidth="10" fill="none" />
              <motion.circle cx="50" cy="50" r="42" stroke={col} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={264} initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: 264 * (1 - c.score / 100) }} transition={{ duration: 1.2 }} /></svg>
            <p className="absolute inset-0 grid place-items-center font-display text-3xl font-black">{c.score}</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold" style={{ color: col }}>{c.verdict}</p>
            <p className="text-sm text-bone-dim">{c.pattern}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-ink/60 p-2"><p className="font-display text-lg font-black">{c.tread_mm} mm</p>Tread</div>
          <div className="rounded-xl bg-ink/60 p-2"><p className="font-display text-lg font-black">{c.psi}</p>psi</div>
          <div className="rounded-xl bg-ink/60 p-2"><p className="font-display text-lg font-black">{c.wet_grip_pct}%</p>Wet grip</div>
        </div>
        <ul className="mt-4 space-y-1 text-sm">{c.findings.map((f) => <li key={f}>• {f}</li>)}</ul>
        {c.recommendation && <p className="mt-4 rounded-xl bg-ink/60 p-3 text-sm">Recommended: <b className="text-molten">{c.recommendation}</b></p>}
        <p className="mt-4 text-xs text-bone-mute">Checked by {c.shop} ({c.tier}, ★ {c.rating}) on {new Date(c.created_at).toLocaleDateString("en-IN")}</p>
      </motion.section>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/twin?serial=${c.serial}`} className="btn-ghost">Open Tyre Twin</Link>
        <Link href={`/board/${c.mechanic_id}`} className="btn-primary">Visit the shop</Link>
      </div>
    </main>
  );
}
