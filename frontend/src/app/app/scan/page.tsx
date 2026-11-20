"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, Zap } from "lucide-react";
import { post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";
import Burst from "@/components/app/Burst";

type ScanRes =
  | { ok: true; points: number; channel: string; balance: number; tier: string; tier_up: string | null; emi: { paid: number; pct: number } | null }
  | { ok: false; flags: { kind: string; detail: string; severity: string }[] };

const MODELS = ["Protorq Extreme", "Bee Connect", "Duratrail", "Vento", "Climber"];
const randSerial = () => "EG" + Array.from({ length: 10 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");

export default function Scan() {
  const { me, refresh } = useMe();
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<ScanRes | null>(null);
  const [last, setLast] = useState<string | null>(null);

  async function submit(s: string) {
    if (!me) return;
    setBusy(true);
    setRes(null);
    await new Promise((r) => setTimeout(r, 900)); // scanning feel
    try {
      const r = await post<ScanRes>("/api/scan", { mechanic_id: me.mechanic.id, serial: s, tyre_model: model });
      setRes(r);
      setLast(s);
      refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Scan a fitment</h1>
      <p className="text-sm text-bone-dim">Point at the QR on the tyre or warranty card.</p>

      <div className="relative mt-5 aspect-square overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_40%,#20242C,#07080A)]">
        <div className="tread-bg absolute inset-0 opacity-70" />
        {/* corners */}
        {["left-6 top-6 border-l-4 border-t-4", "right-6 top-6 border-r-4 border-t-4", "left-6 bottom-6 border-l-4 border-b-4", "right-6 bottom-6 border-r-4 border-b-4"].map((c) => (
          <span key={c} className={`absolute h-12 w-12 rounded-md border-molten ${c}`} />
        ))}
        {/* fake QR */}
        <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 grid-cols-7 gap-1 rounded-lg bg-bone/90 p-2 opacity-80">
          {Array.from({ length: 49 }).map((_, i) => <span key={i} className={(i * 13 + 5) % 3 ? "bg-ink" : ""} />)}
        </div>
        <span className="absolute inset-x-8 h-0.5 animate-scanline bg-molten shadow-[0_0_20px_4px_#ff5a1f]" style={{ animationPlayState: busy ? "running" : "paused" }} />
        <AnimatePresence>
          {res?.ok && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center bg-ink/80 backdrop-blur-sm">
              <Burst />
              <motion.div initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="text-center">
                <p className="font-display text-6xl font-black text-volt">+{res.points}</p>
                <p className="mt-1 text-sm text-bone-dim">{res.channel === "ghost_shelf" ? "Ghost Shelf fitment" : "Stocked fitment"} verified</p>
              </motion.div>
            </motion.div>
          )}
          {res && !res.ok && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 grid place-items-center bg-rose/20 p-6 text-center backdrop-blur-sm">
              <div>
                <ShieldAlert className="mx-auto h-12 w-12 text-rose" />
                <p className="mt-3 font-display text-xl font-bold">Fraud Guard blocked this</p>
                <p className="mt-1 text-sm text-bone-dim">{res.flags[0].detail}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {res?.ok && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2 text-sm">
          {res.emi && <p className="rounded-xl bg-molten/10 p-3">🔧 <b>{res.emi.paid} pts</b> went to your tool EMI — now <b>{res.emi.pct}% owned</b>.</p>}
          <p className="rounded-xl bg-volt/10 p-3">🔁 Rider registered for a Customer Boomerang reminder in ~14 months.</p>
          {res.tier_up && <p className="rounded-xl bg-amber/15 p-3">🏆 Level up! You are now <b>{res.tier_up}</b>.</p>}
        </motion.div>
      )}

      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
        {MODELS.map((m) => (
          <button key={m} onClick={() => setModel(m)} className={`chip shrink-0 ${model === m ? "!border-molten !text-molten" : ""}`}>{m}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} placeholder="EG… serial (or simulate)"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 font-mono text-sm outline-none focus:border-molten" />
        <button disabled={busy || !serial} onClick={() => submit(serial)} className="btn-ghost disabled:opacity-40">Verify</button>
      </div>
      <button disabled={busy} onClick={() => submit(randSerial())} className="btn-primary mt-3 w-full py-3.5 disabled:opacity-60">
        <Zap className="h-4 w-4" /> {busy ? "Scanning…" : "Simulate a QR scan"}
      </button>
      {last && (
        <button disabled={busy} onClick={() => submit(last)} className="mt-2 w-full text-center text-xs text-bone-mute underline">
          Try scanning {last} again (fraud test)
        </button>
      )}
    </div>
  );
}
