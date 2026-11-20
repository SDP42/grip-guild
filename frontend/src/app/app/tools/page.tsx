"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Wrench } from "lucide-react";
import { api, post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";
import { TIER_COLORS, type Tool } from "@/lib/types";

const ORDER = ["Apprentice", "Craftsman", "Master", "Grandmaster"];

export default function Tools() {
  const { me, refresh } = useMe();
  const [tools, setTools] = useState<Tool[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { api<Tool[]>("/api/tools").then(setTools); }, []);
  if (!me) return null;
  const rank = ORDER.indexOf(me.mechanic.tier);

  async function lease(t: Tool) {
    try {
      const r = await post<{ tool: string; fitments_to_own: number }>("/api/tools/lease", { mechanic_id: me!.mechanic.id, tool_id: t.id });
      setMsg(`✅ ${r.tool} leased. About ${r.fitments_to_own} fitments to own it.`); refresh();
    } catch (e) { setMsg(`⚠️ ${(e as Error).message}`); }
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Tool Store</h1>
      <p className="text-sm text-bone-dim">No cash — points buy or lease real equipment. Half of every fitment pays your EMI.</p>

      {me.leases.map((l) => (
        <div key={l.id} className="card mt-4 p-4">
          <div className="flex items-center justify-between text-sm"><span className="font-semibold">{l.tool.name}</span><span className="font-mono text-molten">{l.pct}%</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-600"><motion.div initial={{ width: 0 }} animate={{ width: `${l.pct}%` }} className="h-full bg-molten" /></div>
          <p className="mt-1 text-[11px] text-bone-mute">{l.points_paid.toLocaleString("en-IN")} / {l.points_total.toLocaleString("en-IN")} pts · {l.status}</p>
        </div>
      ))}
      {msg && <p className="mt-3 rounded-xl bg-ink-700 p-3 text-sm">{msg}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {tools.map((t, i) => {
          const locked = ORDER.indexOf(t.tier_required) > rank;
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`relative flex flex-col rounded-2xl border border-white/5 bg-ink-800 p-3 ${locked ? "opacity-60" : ""}`}>
              <div className="grid h-16 place-items-center rounded-xl bg-[radial-gradient(circle,#2C313B,#101216)]">
                <Wrench className="h-7 w-7" style={{ color: TIER_COLORS[t.tier_required] }} />
              </div>
              <p className="mt-2 text-[13px] font-semibold leading-tight">{t.name}</p>
              <p className="mt-0.5 text-[10px] text-bone-mute">{t.blurb}</p>
              <div className="mt-auto pt-2">
                <p className="font-mono text-[11px]"><span className="text-volt">{t.points_cost.toLocaleString("en-IN")} pts</span> <span className="text-bone-mute line-through">₹{t.mrp_inr.toLocaleString("en-IN")}</span></p>
                {locked ? (
                  <p className="mt-1.5 flex items-center gap-1 text-[10px]" style={{ color: TIER_COLORS[t.tier_required] }}><Lock className="h-3 w-3" /> {t.tier_required}</p>
                ) : (
                  <button onClick={() => lease(t)} className="mt-1.5 w-full rounded-lg bg-molten/15 py-1.5 text-[11px] font-semibold text-molten">Lease to own</button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
