"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { Coach, CoachCard } from "@/lib/types";
import { useMe } from "./MeContext";

const KIND_C: Record<string, string> = { sos: "#F43F5E", boomerang: "#C6FF3D", quest: "#A78BFA", tool: "#FF5A1F", tier: "#FFB020", shelf: "#FFB020", referral: "#C6FF3D", academy: "#A78BFA", streak: "#FF5A1F", rating: "#38BDF8" };

/** Guild Coach: a personal plan computed by the backend from this mechanic's own data. */
export default function CoachDeck() {
  const { me, inbox } = useMe();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (me) api<Coach>(`/api/mechanics/${me.mechanic.id}/coach`).then((c) => { setCoach(c); setI(0); }).catch(() => {});
  }, [me, inbox?.sos.length, inbox?.unread]);

  if (!coach) return <div className="h-36 animate-pulse rounded-2xl bg-ink-700" />;
  const [head, ...cards] = coach;
  const card: CoachCard | undefined = cards[i % Math.max(1, cards.length)];
  const c = card ? KIND_C[card.kind] ?? "#FF5A1F" : "#FF5A1F";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-bone-dim"><Sparkles className="h-4 w-4 text-molten" /> Guild Coach</p>
        <div className="flex gap-1">
          {cards.map((_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Tip ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-molten" : "w-1.5 bg-white/20"}`} />
          ))}
        </div>
      </div>
      <p className="mt-1 text-[11px] text-bone-mute">{head.greeting}</p>
      <AnimatePresence mode="wait">
        {card && (
          <motion.div key={card.title} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => {
              if (info.offset.x < -50) setI((v) => (v + 1) % cards.length);
              if (info.offset.x > 50) setI((v) => (v - 1 + cards.length) % cards.length);
            }} className="mt-3 cursor-grab active:cursor-grabbing">
            <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${c}26, transparent)` }}>
              <p className="font-display text-lg font-bold leading-tight">{card.title}</p>
              <p className="mt-1 text-xs text-bone-dim">{card.body}</p>
              <Link href={card.href} className="mt-3 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-ink" style={{ background: c }}>{card.cta} →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
