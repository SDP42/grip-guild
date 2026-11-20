"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { api } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";

type Shelf = { dealer: string; sla_hours: number; km: number; items: { model: string; size: string; mrp: number; tag: string; fitment_points: number }[] };

export default function GhostShelf() {
  const { me } = useMe();
  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [ordered, setOrdered] = useState<string | null>(null);
  useEffect(() => { if (me) api<Shelf>(`/api/ghost-shelf/${me.mechanic.id}`).then(setShelf); }, [me]);
  if (!shelf) return <div className="m-4 h-40 animate-pulse rounded-2xl bg-ink-700" />;

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Ghost Shelf</h1>
      <p className="text-sm text-bone-dim">Sell Eurogrip with zero inventory. Order here, the dealer delivers to your shop, you fit it and earn.</p>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber/30 bg-amber/10 p-3 text-sm">
        <Truck className="h-6 w-6 text-amber" />
        <div><p className="font-semibold">{shelf.dealer}</p><p className="text-xs text-bone-dim">{shelf.km} km away · delivers in ~{shelf.sla_hours} h</p></div>
      </div>
      <div className="mt-4 space-y-2">
        {shelf.items.map((it, i) => (
          <motion.div key={it.model} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-2xl bg-ink-800 p-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-[6px] border-ink-500 bg-ink-600"><span className="h-4 w-4 rounded-full bg-molten" /></div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{it.model} <span className="font-mono text-[11px] text-bone-mute">{it.size}</span></p>
              <p className="text-[11px] text-bone-dim">{it.tag}</p>
              <p className="font-mono text-[11px]">₹{it.mrp.toLocaleString("en-IN")} · <span className="text-volt">+{it.fitment_points} pts on fitment</span></p>
            </div>
            <button onClick={() => setOrdered(it.model)} className="rounded-xl bg-molten px-3 py-2 text-xs font-bold text-ink">Order</button>
          </motion.div>
        ))}
      </div>
      {ordered && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 rounded-2xl bg-volt/10 p-4 text-sm">
          🚚 <b>{ordered}</b> is on its way from {shelf.dealer}. ETA {shelf.sla_hours} h. Scan it after fitting to earn your points.
        </motion.div>
      )}
    </div>
  );
}
