"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, MapPin, Repeat, Send, Siren } from "lucide-react";
import { post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";

const KIND_C: Record<string, string> = { sos: "#F43F5E", referral: "#C6FF3D", order: "#38BDF8", rating: "#FFB020", quest: "#A78BFA", tier: "#FF5A1F", credit: "#C6FF3D", system: "#7E838E" };
const ago = (s: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(s).getTime()) / 60000));
  return m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
};

export default function InboxPage() {
  const { me, inbox, refresh } = useMe();
  const [sent, setSent] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    if (!me) return;
    const t = setTimeout(() => post(`/api/mechanics/${me.mechanic.id}/inbox/read`, {}).catch(() => {}), 2500);
    return () => clearTimeout(t);
  }, [me]);

  async function sos(id: number, action: "accept" | "fixed") {
    setBusy(id);
    await post(`/api/sos/${id}/${action}`, {});
    await refresh(); setBusy(null);
  }
  async function remind(fid: number) {
    setBusy(fid);
    const r = await post<{ message: string; whatsapp: string }>(`/api/boomerang/${fid}/send`, {});
    setSent((s) => ({ ...s, [fid]: r.message }));
    window.open(r.whatsapp, "_blank", "noopener");
    setBusy(null);
  }

  if (!inbox) return <div className="m-4 h-40 animate-pulse rounded-2xl bg-ink-700" />;

  return (
    <div className="space-y-6 px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Inbox</h1>

      <section>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Siren className="h-4 w-4 text-rose" /> Puncture SOS leads</p>
        {inbox.sos.length === 0 ? (
          <p className="rounded-2xl bg-ink-800 p-4 text-xs text-bone-dim">No open leads. Open <Link href="/rider" target="_blank" className="text-molten underline">the rider view</Link> and press SOS to send one here.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {inbox.sos.map((s) => (
                <motion.div key={s.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-rose/30 bg-rose/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{s.rider_name} · flat tyre</p>
                    <span className="font-mono text-[11px] text-bone-dim">{ago(s.created_at)} ago</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-bone-dim"><MapPin className="h-3.5 w-3.5" /> {s.distance_km} km · ~{s.eta_min} min · Fleet Pit Pass priority</p>
                  {s.status === "requested" ? (
                    <button disabled={busy === s.id} onClick={() => sos(s.id, "accept")} className="btn mt-3 w-full bg-rose text-white">Accept & send ETA</button>
                  ) : (
                    <button disabled={busy === s.id} onClick={() => sos(s.id, "fixed")} className="btn mt-3 w-full bg-volt text-ink">Job done (+40 pts)</button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Repeat className="h-4 w-4 text-volt" /> Customer Boomerang · riders due back</p>
        <div className="space-y-2">
          {inbox.boomerang.length === 0 && <p className="rounded-2xl bg-ink-800 p-4 text-xs text-bone-dim">Everyone is up to date.</p>}
          {inbox.boomerang.map((b) => (
            <div key={b.fitment_id} className="rounded-2xl bg-ink-800 p-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{b.rider} <span className="text-xs font-normal text-bone-mute">· {b.vehicle}</span></p>
                  <p className="text-[11px] text-bone-dim">{b.tyre_model} · {b.overdue ? <span className="text-rose">overdue</span> : `due ${new Date(b.due).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}</p>
                </div>
                {sent[b.fitment_id] ? (
                  <span className="flex items-center gap-1 text-[11px] text-volt"><CheckCircle2 className="h-4 w-4" /> Sent</span>
                ) : (
                  <button disabled={busy === b.fitment_id} onClick={() => remind(b.fitment_id)} className="flex items-center gap-1 rounded-xl bg-[#25D366]/15 px-3 py-2 text-xs font-semibold text-[#25D366]">
                    <Send className="h-3.5 w-3.5" /> Remind
                  </button>
                )}
              </div>
              {sent[b.fitment_id] && <p className="mt-2 rounded-xl bg-[#005C4B]/60 p-2 text-[11px]">{sent[b.fitment_id]}</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-amber" /> Activity</p>
        <ul className="space-y-1.5">
          {inbox.notifications.map((n) => (
            <motion.li key={n.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Link href={n.link || "/app"} className={`flex gap-3 rounded-2xl p-3 ${n.read ? "bg-ink-800" : "bg-ink-700 ring-1 ring-white/10"}`}>
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_C[n.kind] ?? "#7E838E" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-[11px] text-bone-dim">{n.body}</p>
                </div>
                <span className="font-mono text-[10px] text-bone-mute">{ago(n.created_at)}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
