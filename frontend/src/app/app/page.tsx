"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Boxes, Flame, Fingerprint, MessageCircle, Repeat, ScanLine, Share2, Star, Wrench } from "lucide-react";
import { useMe } from "@/components/app/MeContext";
import ScoreRing from "@/components/app/ScoreRing";
import CountUp from "@/components/CountUp";
import { TIER_COLORS } from "@/lib/types";

const QUICK = [
  { href: "/app/scan", icon: ScanLine, label: "Scan fitment", c: "#FF5A1F" },
  { href: "/app/refer", icon: Share2, label: "Refer rider", c: "#C6FF3D" },
  { href: "/app/treadlens", icon: Star, label: "TreadLens", c: "#38BDF8" },
  { href: "/app/shelf", icon: Boxes, label: "Ghost Shelf", c: "#FFB020" },
  { href: "/app/tools", icon: Wrench, label: "Tools", c: "#F43F5E" },
  { href: "/app/academy", icon: BookOpen, label: "Academy", c: "#A78BFA" },
  { href: "/app/passport", icon: Fingerprint, label: "Passport", c: "#C6FF3D" },
  { href: "/app/bot", icon: MessageCircle, label: "Guild Bot", c: "#25D366" },
];

function Skeleton() {
  return <div className="space-y-4 p-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-ink-700" />)}</div>;
}

export default function AppHome() {
  const { me } = useMe();
  if (!me) return <Skeleton />;
  const m = me.mechanic;
  const tc = TIER_COLORS[m.tier];
  const lease = me.leases.find((l) => l.status === "active") ?? me.leases[0];

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-bone-mute">Welcome back</p>
          <h1 className="font-display text-xl font-bold">{m.name.split(" ")[0]}</h1>
          <p className="text-xs text-bone-dim">{m.shop_name} · {me.district.name}</p>
        </div>
        <span className="chip !text-bone" style={{ borderColor: `${tc}66`, background: `${tc}18` }}>
          <span className="h-2 w-2 rounded-full" style={{ background: tc }} /> {m.tier}
        </span>
      </header>

      {/* Score + wallet */}
      <section className="card relative overflow-hidden p-5">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: `${tc}33` }} />
        <div className="relative flex items-center gap-5">
          <ScoreRing score={me.guild_score.score} color={tc} />
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-bone-mute">Points balance</p>
            <p className="font-display text-3xl font-black"><CountUp to={m.points} /></p>
            <p className="mt-1 flex items-center gap-1 text-xs text-amber"><Flame className="h-3.5 w-3.5" /> {m.streak_weeks}-week streak</p>
            <p className="mt-1 text-xs text-bone-dim">Band: <b className="text-volt">{me.guild_score.band}</b></p>
          </div>
        </div>
        {me.next_tier && (
          <div className="relative mt-5">
            <div className="mb-1.5 flex justify-between text-[11px] text-bone-dim">
              <span>{m.lifetime_points.toLocaleString("en-IN")} lifetime pts</span>
              <span>{(me.next_tier.min - m.lifetime_points).toLocaleString("en-IN")} to <b style={{ color: me.next_tier.color }}>{me.next_tier.name}</b></span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-600">
              <motion.div initial={{ width: 0 }} animate={{ width: `${me.tier_progress}%` }} transition={{ duration: 1.2 }}
                className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${tc}, ${me.next_tier.color})` }} />
            </div>
          </div>
        )}
      </section>

      {/* Tool EMI */}
      {lease && (
        <Link href="/app/tools" className="card block overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Fitments pay off your tools</p>
            <span className="font-mono text-xs text-bone-mute">{lease.status === "owned" ? "OWNED ✓" : "ON LEASE"}</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="font-display text-lg font-bold">{lease.tool.name}</p>
              <p className="text-xs text-bone-dim">MRP ₹{lease.tool.mrp_inr.toLocaleString("en-IN")} · ~{Math.ceil((lease.points_total - lease.points_paid) / 30)} fitments to own</p>
            </div>
            <p className="font-display text-3xl font-black text-molten">{lease.pct}%</p>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.span key={i} initial={{ opacity: 0.2 }} animate={{ opacity: i < lease.pct / 5 ? 1 : 0.2 }} transition={{ delay: i * 0.04 }}
                className="h-6 flex-1 rounded-sm" style={{ background: i < lease.pct / 5 ? "#FF5A1F" : "#20242C" }} />
            ))}
          </div>
        </Link>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-4 gap-2">
        {QUICK.map((q, i) => (
          <motion.div key={q.href} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}>
            <Link href={q.href} className="flex flex-col items-center gap-1.5 rounded-2xl bg-ink-800 p-3 text-center text-[10px] text-bone-dim active:scale-95">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${q.c}1f` }}>
                <q.icon className="h-5 w-5" style={{ color: q.c }} />
              </span>
              {q.label}
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-3 gap-2">
        {[
          { l: "Fitments", v: me.fitments_total },
          { l: "Referral → sale", v: me.referrals.conversion_pct, s: "%" },
          { l: "Rating", v: m.rating, d: 1, s: "★" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-ink-800 p-3">
            <p className="font-display text-xl font-bold"><CountUp to={s.v} decimals={s.d ?? 0} suffix={s.s} /></p>
            <p className="text-[10px] text-bone-mute">{s.l}</p>
          </div>
        ))}
      </section>

      {/* Boomerang + Circle */}
      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-volt/20 bg-volt/[0.06] p-4">
          <Repeat className="h-5 w-5 text-volt" />
          <p className="mt-2 font-display text-2xl font-black">{me.boomerang_upcoming}</p>
          <p className="text-[11px] text-bone-dim">riders due back to you in 120 days (Customer Boomerang)</p>
        </div>
        {me.circle && (
          <div className="rounded-2xl border border-sky/20 bg-sky/[0.06] p-4">
            <p className="text-[11px] font-semibold text-sky">{me.circle.name}</p>
            <p className="mt-2 font-display text-2xl font-black">{Math.round((100 * me.circle.progress_fitments) / me.circle.goal_fitments)}%</p>
            <p className="text-[11px] text-bone-dim">to unlock a shared {me.circle.unlock_reward}</p>
          </div>
        )}
      </section>

      {/* Recent */}
      <section className="card p-4">
        <p className="mb-3 font-semibold">Recent verified fitments</p>
        <ul className="divide-y divide-white/5">
          {me.recent_fitments.slice(0, 5).map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p>{f.tyre_model} <span className="text-bone-mute">· {f.vehicle}</span></p>
                <p className="font-mono text-[10px] text-bone-mute">{f.serial} · {f.channel.replace("_", " ")}</p>
              </div>
              <span className="font-mono text-volt">+{f.points}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
