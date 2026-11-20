"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, LifeBuoy, ShieldCheck, Star, Wrench } from "lucide-react";
import { api, post } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { TIER_COLORS } from "@/lib/types";

type Board = {
  id: number; shop: string; name: string; district: string; state: string; tier: string; rating: number; ratings_count: number;
  badges: string[]; guild_score: number; verified_fitments: number; sos_rescues: number; stocks_eurogrip: boolean; member_since: string;
  reviews: { stars: number; comment: string; created_at: string }[];
};

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [b, setB] = useState<Board | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [missing, setMissing] = useState(false);

  const load = () => api<Board>(`/api/board/${id}`).then(setB).catch(() => setMissing(true));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function rate() {
    await post("/api/rider/rate", { mechanic_id: Number(id), stars, comment });
    setDone(true); load();
  }

  if (missing) return <main className="grid min-h-screen place-items-center p-6 text-center"><p>This shop isn&apos;t in the Guild. <Link href="/" className="text-molten underline">Grip Guild</Link></p></main>;
  if (!b) return <main className="grid min-h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-molten border-t-transparent" /></main>;
  const c = TIER_COLORS[b.tier];

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-6">
      <header className="flex items-center justify-between">
        <Logo className="text-base" />
        <span className="chip !text-volt"><ShieldCheck className="h-3.5 w-3.5" /> Verified Guild shop</span>
      </header>

      <motion.section initial={{ rotateX: -40, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 90 }} style={{ transformPerspective: 900 }}
        className="relative mt-6 overflow-hidden rounded-3xl border-2 p-6" >
        <div className="absolute inset-0" style={{ background: `linear-gradient(130deg, ${c}55, #07080A 65%)` }} />
        <div className="tread-bg absolute inset-0 opacity-30" />
        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: c }}>Grip Guild · {b.tier}</p>
          <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">{b.shop}</h1>
          <p className="text-sm text-bone-dim">{b.name} · {b.district}, {b.state}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-5 w-5 ${n <= Math.round(b.rating) ? "fill-amber text-amber" : "text-bone-mute"}`} />)}</div>
            <span className="font-semibold">{b.rating}</span><span className="text-xs text-bone-mute">({b.ratings_count} riders)</span>
          </div>
        </div>
      </motion.section>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="card p-3"><p className="font-display text-2xl font-black">{b.guild_score}</p><p className="text-[10px] text-bone-mute">Guild Score</p></div>
        <div className="card p-3"><Wrench className="mx-auto h-4 w-4 text-molten" /><p className="font-display text-xl font-black">{b.verified_fitments}</p><p className="text-[10px] text-bone-mute">Verified fitments</p></div>
        <div className="card p-3"><LifeBuoy className="mx-auto h-4 w-4 text-rose" /><p className="font-display text-xl font-black">{b.sos_rescues}</p><p className="text-[10px] text-bone-mute">SOS rescues</p></div>
      </div>

      <section className="card mt-4 p-4">
        <p className="text-sm font-semibold">Certified skills</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {b.badges.length ? b.badges.map((x) => <span key={x} className="chip !text-amber"><BadgeCheck className="h-3.5 w-3.5" /> {x}</span>) : <span className="text-xs text-bone-mute">No badges yet</span>}
        </div>
        <p className="mt-3 text-[11px] text-bone-mute">Member since {new Date(b.member_since).toLocaleDateString("en-IN", { month: "long", year: "numeric" })} · {b.stocks_eurogrip ? "Stocks Eurogrip" : "Orders Eurogrip on demand (Ghost Shelf)"}</p>
      </section>

      <section className="card mt-4 p-4">
        <p className="text-sm font-semibold">Rate this shop</p>
        {done ? <p className="mt-2 rounded-xl bg-volt/10 p-3 text-sm">Thanks! Your rating is live and the mechanic has been notified.</p> : (
          <>
            <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}><Star className={`h-8 w-8 ${n <= stars ? "fill-amber text-amber" : "text-bone-mute"}`} /></button>)}</div>
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did they do well?" className="mt-3 w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2.5 text-sm outline-none focus:border-molten" />
            <button onClick={rate} className="btn-primary mt-3 w-full">Submit rating</button>
          </>
        )}
      </section>

      <section className="mt-4 space-y-2">
        {b.reviews.map((r, i) => (
          <div key={i} className="rounded-2xl bg-ink-800 p-3 text-sm">
            <div className="flex">{Array.from({ length: r.stars }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-amber text-amber" />)}</div>
            <p className="mt-1 text-bone-dim">{r.comment || "—"}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
