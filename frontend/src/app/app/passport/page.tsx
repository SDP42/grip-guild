"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useMe } from "@/components/app/MeContext";
import { TIER_COLORS } from "@/lib/types";

export default function Passport() {
  const { me } = useMe();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [14, -14]));
  const ry = useSpring(useTransform(x, [0, 1], [-18, 18]));
  const sheen = useTransform(x, (v) => `linear-gradient(${105 + v * 40}deg, transparent 20%, rgba(255,255,255,.22) ${30 + v * 30}%, transparent 70%)`);
  if (!me) return null;
  const m = me.mechanic;
  const c = TIER_COLORS[m.tier];
  const p = me.passport;

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Guild Passport</h1>
      <p className="text-sm text-bone-dim">Your verified work history — portable proof that unlocks credit and insurance.</p>

      <div className="mt-6" style={{ perspective: 1000 }}>
        <motion.div
          onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width); y.set((e.clientY - r.top) / r.height); }}
          onPointerLeave={() => { x.set(0.5); y.set(0.5); }}
          style={{ rotateX: rx, rotateY: ry, background: `linear-gradient(135deg, ${c}, #1a1208 55%, #07080A)` }}
          className="relative aspect-[1.6/1] overflow-hidden rounded-3xl p-5 shadow-2xl"
        >
          <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
          <div className="tread-bg absolute inset-0 opacity-40" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/70">Grip Guild Passport</p>
                <p className="font-display text-xl font-black">{m.name}</p>
                <p className="text-xs text-bone/80">{m.shop_name} · {me.district.name}</p>
              </div>
              <span className="rounded-full bg-ink/50 px-2 py-1 text-[10px] font-bold" style={{ color: c }}>{m.tier.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><p className="font-display text-lg font-black">{me.guild_score.score}</p><p className="text-bone/60">Guild Score</p></div>
              <div><p className="font-display text-lg font-black">{p.verified_fitments}</p><p className="text-bone/60">Verified fitments</p></div>
              <div><p className="font-display text-lg font-black">{p.verified_months} mo</p><p className="text-bone/60">History</p></div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center gap-3 rounded-2xl bg-ink-800 p-4">
          <ShieldCheck className="h-6 w-6 text-volt" />
          <div className="flex-1"><p className="text-sm font-semibold">Working-capital line</p><p className="text-[11px] text-bone-dim">{p.partner}</p></div>
          <p className="font-display text-xl font-black text-volt">₹{p.credit_line_inr.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-ink-800 p-4">
          <BadgeCheck className="h-6 w-6 text-sky" />
          <div className="flex-1"><p className="text-sm font-semibold">Insurance</p><p className="text-[11px] text-bone-dim">{p.insurance}</p></div>
        </div>
        <p className="pt-2 text-sm font-semibold">Badges</p>
        <div className="flex flex-wrap gap-2">
          {me.certifications.map((cert) => <span key={cert.verify_code} className="chip !text-amber">🏅 {cert.module.badge}</span>)}
        </div>
      </div>
    </div>
  );
}
