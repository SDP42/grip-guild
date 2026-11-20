"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";
import Burst from "@/components/app/Burst";

export default function Quests() {
  const { me, refresh } = useMe();
  const [msg, setMsg] = useState<string | null>(null);
  const [burst, setBurst] = useState<string | null>(null);
  if (!me) return null;

  async function claim(slug: string) {
    try {
      const r = await post<{ points: number }>(`/api/quests/${slug}/claim?mechanic_id=${me!.mechanic.id}`, {});
      setBurst(slug); setMsg(`+${r.points} pts claimed!`); refresh();
    } catch (e) { setMsg((e as Error).message); }
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Seasonal Quests</h1>
      <p className="text-sm text-bone-dim">Time-boxed missions that keep the Guild alive long after sign-up. Progress comes from your real scans, checks and referrals.</p>
      {msg && <p className="mt-3 rounded-xl bg-ink-700 p-3 text-sm">{msg}</p>}
      <div className="mt-4 space-y-3">
        {me.quests.map((q, i) => (
          <motion.div key={q.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border p-4" style={{ borderColor: `${q.color}40`, background: `linear-gradient(140deg, ${q.color}14, #101216 60%)` }}>
            {burst === q.slug && <Burst />}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: q.color }}>{q.season}</p>
                <p className="font-display text-lg font-bold">{q.title}</p>
                <p className="text-xs text-bone-dim">{q.goal}</p>
              </div>
              <Trophy className="h-6 w-6 shrink-0" style={{ color: q.color }} />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-600">
              <motion.div initial={{ width: 0 }} animate={{ width: `${q.pct}%` }} className="h-full rounded-full" style={{ background: q.color }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-mono">{q.current}/{q.target}</span>
              {q.claimed ? <span className="text-volt">Claimed ✓</span> : q.done ? (
                <button onClick={() => claim(q.slug)} className="rounded-lg px-3 py-1.5 font-bold text-ink" style={{ background: q.color }}>Claim {q.points} pts</button>
              ) : <span className="text-bone-mute">Reward: {q.reward}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
