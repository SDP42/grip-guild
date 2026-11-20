"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { api, post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";

type Order = { id: number; tyre_model: string; size: string; status: string; eta_hours: number; created_at: string };
const ST_C: Record<string, string> = { placed: "#FFB020", dispatched: "#38BDF8", delivered: "#A78BFA", fitted: "#C6FF3D" };
type Shelf = { dealer: string; sla_hours: number; km: number; items: { model: string; size: string; mrp: number; tag: string; fitment_points: number }[] };

export default function GhostShelf() {
  const { me } = useMe();
  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [ordered, setOrdered] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const meId = me?.mechanic.id;
  useEffect(() => { if (meId) api<Shelf>(`/api/ghost-shelf/${meId}`).then(setShelf); }, [meId]);
  useEffect(() => {
    if (!meId) return;
    const load = () => api<Order[]>(`/api/mechanics/${meId}/orders`).then(setOrders).catch(() => {});
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [meId]);

  async function order(model: string, size: string) {
    if (!meId) return;
    await post("/api/ghost-orders", { mechanic_id: meId, tyre_model: model, size });
    setOrdered(model);
    setOrders(await api<Order[]>(`/api/mechanics/${meId}/orders`));
  }
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
            <button onClick={() => order(it.model, it.size)} className="rounded-xl bg-molten px-3 py-2 text-xs font-bold text-ink">Order</button>
          </motion.div>
        ))}
      </div>
      {ordered && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 rounded-2xl bg-volt/10 p-4 text-sm">
          📦 <b>{ordered}</b> ordered from {shelf.dealer}. It appears in the <a href="/dealer" target="_blank" className="underline">dealer&apos;s queue</a> now; you&apos;ll be notified as it moves.
        </motion.div>
      )}
      {orders.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">My orders (live)</p>
          <ul className="space-y-1.5">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-xl bg-ink-800 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{o.tyre_model} <span className="font-mono text-[11px] text-bone-mute">{o.size}</span></span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize" style={{ background: `${ST_C[o.status]}22`, color: ST_C[o.status] }}>{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
