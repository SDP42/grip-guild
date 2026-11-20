"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCheck, Copy, Store } from "lucide-react";
import { post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";
import Burst from "@/components/app/Burst";

type Ref = { code: string; dealer: string; km: number; share_text: string };

export default function Refer() {
  const { me, refresh } = useMe();
  const [ref, setRef] = useState<Ref | null>(null);
  const [redeemed, setRedeemed] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!me) return;
    setBusy(true); setRedeemed(null);
    setRef(await post<Ref>("/api/referrals", { mechanic_id: me.mechanic.id }));
    setBusy(false);
  }
  async function redeem() {
    if (!ref) return;
    setBusy(true);
    const r = await post<{ points: number }>(`/api/referrals/${ref.code}/redeem`, {});
    setRedeemed(r.points); refresh(); setBusy(false);
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Refer a rider</h1>
      <p className="text-sm text-bone-dim">Don&apos;t stock Eurogrip? Your word still counts. Earn <b className="text-volt">80 pts</b> when the rider buys at a dealer.</p>

      {me && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["Issued", me.referrals.issued], ["Redeemed", me.referrals.redeemed], ["Conversion", `${me.referrals.conversion_pct}%`]].map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-ink-800 p-3"><p className="font-display text-xl font-bold">{v}</p><p className="text-[10px] text-bone-mute">{l}</p></div>
          ))}
        </div>
      )}

      <button onClick={create} disabled={busy} className="btn-primary mt-5 w-full py-3.5">Generate referral code</button>

      {ref && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
          {/* Ticket */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-molten to-amber p-5 text-ink">
            {redeemed && <Burst />}
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Grip Guild referral</p>
            <p className="mt-2 font-display text-4xl font-black tracking-wider">{ref.code}</p>
            <div className="my-4 border-t-2 border-dashed border-ink/30" />
            <p className="flex items-center gap-2 text-sm font-semibold"><Store className="h-4 w-4" /> {ref.dealer} · {ref.km} km</p>
            <p className="text-xs opacity-80">Valid 14 days · free fitting check for the rider</p>
          </div>

          {/* WhatsApp preview */}
          <div className="rounded-2xl bg-[#0B141A] p-3">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-bone-mute">WhatsApp preview</p>
            <div className="ml-auto w-[88%] rounded-2xl rounded-tr-sm bg-[#005C4B] p-3 text-sm">
              {ref.share_text}
              <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-bone/60">now <CheckCheck className="h-3 w-3 text-sky" /></p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => navigator.clipboard?.writeText(ref.share_text)} className="btn-ghost flex-1"><Copy className="h-4 w-4" /> Copy</button>
            <button onClick={redeem} disabled={busy || !!redeemed} className="btn-ghost flex-1 !border-volt/40 !text-volt disabled:opacity-50">
              {redeemed ? `+${redeemed} pts credited` : "Simulate dealer sale"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
