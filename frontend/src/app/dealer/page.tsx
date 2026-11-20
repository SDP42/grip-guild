"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PackageCheck, Ticket, Truck } from "lucide-react";
import { api, post } from "@/lib/api";
import PersonaHeader from "@/components/PersonaHeader";
import CountUp from "@/components/CountUp";

type Queue = {
  dealer: { id: number; name: string; ghost_shelf_sla_hours: number };
  stats: { referral_sales: number; open_codes: number; ghost_orders: number; partner_shops: number };
  referrals: { id: number; code: string; status: string; tyre_model: string; shop: string; created_at: string }[];
  orders: { id: number; tyre_model: string; size: string; status: string; shop: string; created_at: string; eta_hours: number }[];
};

const STATUS_C: Record<string, string> = { issued: "#FFB020", redeemed: "#C6FF3D", expired: "#7E838E", placed: "#FFB020", dispatched: "#38BDF8", delivered: "#A78BFA", fitted: "#C6FF3D" };

export default function Dealer() {
  const [q, setQ] = useState<Queue | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [dealerId, setDealerId] = useState(1);

  const load = useCallback(() => api<Queue>(`/api/dealer/${dealerId}/queue`).then(setQ), [dealerId]);
  useEffect(() => { load(); }, [load]);

  async function redeem(c: string) {
    try {
      const r = await post<{ mechanic: string; points: number }>(`/api/referrals/${c.trim().toUpperCase()}/redeem`, {});
      setMsg(`✅ Sale recorded. ${r.mechanic} earned ${r.points} pts for recommending Eurogrip.`); setCode(""); load();
    } catch (e) { setMsg(`⚠️ ${(e as Error).message}`); }
  }
  async function advance(id: number) { await post(`/api/ghost-orders/${id}/advance`, {}); load(); }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <PersonaHeader initials="BT" color="#A78BFA" kind="Dealer" name={q?.dealer.name ?? "Dealer"} sub={`Eurogrip dealer · Ghost Shelf SLA ${q?.dealer.ghost_shelf_sla_hours ?? "–"} h · switch dealer below`} />

      <div className="mt-4 flex items-center gap-2 text-xs text-bone-dim">
        Dealer #
        {[1, 2, 3, 4].map((n) => <button key={n} onClick={() => setDealerId(n)} className={`chip ${dealerId === n ? "!border-[#A78BFA] !text-[#A78BFA]" : ""}`}>{n}</button>)}
      </div>

      {q && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Referral sales", q.stats.referral_sales], ["Open codes", q.stats.open_codes], ["Ghost orders", q.stats.ghost_orders], ["Partner shops", q.stats.partner_shops]].map(([l, v]) => (
              <div key={l as string} className="card p-5"><p className="font-display text-3xl font-black"><CountUp to={v as number} /></p><p className="mt-1 text-xs text-bone-mute">{l}</p></div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <p className="flex items-center gap-2 font-display text-xl font-bold"><Ticket className="h-5 w-5 text-[#A78BFA]" /> Redeem a mechanic&apos;s code</p>
              <p className="text-sm text-bone-dim">The rider shows a code from their mechanic. Redeeming it credits the mechanic — even if they don&apos;t stock Eurogrip.</p>
              <form onSubmit={(e) => { e.preventDefault(); redeem(code); }} className="mt-4 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="GG-XXXXX" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-700 px-4 py-3 font-mono outline-none focus:border-[#A78BFA]" />
                <button className="btn bg-[#A78BFA] text-ink">Redeem</button>
              </form>
              {msg && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl bg-ink-700 p-3 text-sm">{msg}</motion.p>}
              <ul className="mt-5 max-h-[360px] space-y-1.5 overflow-y-auto pr-1 no-scrollbar">
                {q.referrals.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl bg-ink-700 px-3 py-2 text-sm">
                    <span className="font-mono">{r.code}</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-bone-dim">{r.shop} · {r.tyre_model}</span>
                    {r.status === "issued" ? (
                      <button onClick={() => redeem(r.code)} className="rounded-lg bg-[#A78BFA]/20 px-2 py-1 text-[11px] font-semibold text-[#A78BFA]">Redeem</button>
                    ) : (
                      <span className="text-[11px] capitalize" style={{ color: STATUS_C[r.status] }}>{r.status}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="card p-5">
              <p className="flex items-center gap-2 font-display text-xl font-bold"><Truck className="h-5 w-5 text-sky" /> Ghost Shelf orders</p>
              <p className="text-sm text-bone-dim">Non-stocking shops order here; you deliver within the SLA. Every delivery is a Eurogrip sale you would have missed.</p>
              <ul className="mt-5 max-h-[430px] space-y-1.5 overflow-y-auto pr-1 no-scrollbar">
                {q.orders.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 rounded-xl bg-ink-700 px-3 py-2.5 text-sm">
                    <PackageCheck className="h-4 w-4 shrink-0" style={{ color: STATUS_C[o.status] }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{o.tyre_model} <span className="font-mono text-[11px] text-bone-mute">{o.size}</span></p>
                      <p className="truncate text-[11px] text-bone-dim">{o.shop}</p>
                    </div>
                    {o.status === "fitted" ? (
                      <span className="flex items-center gap-1 text-[11px] text-volt"><CheckCircle2 className="h-3.5 w-3.5" /> fitted</span>
                    ) : (
                      <button onClick={() => advance(o.id)} className="rounded-lg px-2 py-1 text-[11px] font-semibold capitalize" style={{ background: `${STATUS_C[o.status]}22`, color: STATUS_C[o.status] }}>
                        {o.status} →
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
