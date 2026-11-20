"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { api, post } from "@/lib/api";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useMe } from "@/components/app/MeContext";
import { TIER_COLORS } from "@/lib/types";

type App = { id: number; amount_inr: number; purpose: string; status: string; emi_inr: number; created_at: string; limit_inr?: number };
const ST: Record<string, string> = { approved: "#C6FF3D", review: "#FFB020", declined: "#F43F5E" };

export default function Passport() {
  const { me, refresh } = useMe();
  const [amount, setAmount] = useState(20000);
  const [purpose, setPurpose] = useState("Workshop equipment");
  const [apps, setApps] = useState<App[]>([]);
  const [last, setLast] = useState<App | null>(null);
  const meId = me?.mechanic.id;
  useEffect(() => { if (meId) api<App[]>(`/api/mechanics/${meId}/credit`).then(setApps); }, [meId]);
  async function apply() {
    if (!meId) return;
    const r = await post<App>("/api/passport/apply", { mechanic_id: meId, amount_inr: amount, purpose });
    setLast(r); setApps(await api<App[]>(`/api/mechanics/${meId}/credit`)); refresh();
  }
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
        <div className="card space-y-3 p-4">
          <p className="text-sm font-semibold">Apply for working capital</p>
          <label className="block text-xs text-bone-dim">Amount: <b className="text-bone">₹{amount.toLocaleString("en-IN")}</b>
            <input type="range" min={5000} max={150000} step={5000} value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-1 w-full accent-[#C6FF3D]" />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {["Workshop equipment", "Tyre stock", "Shop renovation", "Family emergency"].map((x) => (
              <button key={x} onClick={() => setPurpose(x)} className={`chip ${purpose === x ? "!border-volt !text-volt" : ""}`}>{x}</button>
            ))}
          </div>
          <button onClick={apply} className="btn w-full bg-volt text-ink">Apply with my Guild Passport</button>
          {last && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-3 text-sm" style={{ background: `${ST[last.status]}18`, color: ST[last.status] }}>
              {last.status === "approved" ? "✅ Approved instantly" : last.status === "review" ? "⏳ Sent for review" : "✖ Above your limit"} · ₹{last.amount_inr.toLocaleString("en-IN")} · EMI ₹{last.emi_inr.toLocaleString("en-IN")}/month · limit ₹{last.limit_inr?.toLocaleString("en-IN")}
            </motion.p>
          )}
          {apps.length > 0 && (
            <ul className="space-y-1 text-xs">
              {apps.slice(0, 4).map((a) => (
                <li key={a.id} className="flex justify-between rounded-lg bg-ink-700 px-3 py-1.5"><span>{a.purpose} · ₹{a.amount_inr.toLocaleString("en-IN")}</span><span className="capitalize" style={{ color: ST[a.status] }}>{a.status}</span></li>
              ))}
            </ul>
          )}
        </div>
        <p className="pt-2 text-sm font-semibold">Badges</p>
        <div className="flex flex-wrap gap-2">
          {me.certifications.map((cert) => <span key={cert.verify_code} className="chip !text-amber">🏅 {cert.module.badge}</span>)}
        </div>
      </div>
    </div>
  );
}
