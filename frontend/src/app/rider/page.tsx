"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Bike, Clock, ShieldCheck, Siren, Star } from "lucide-react";
import { api, post } from "@/lib/api";
import RadarMap from "@/components/RadarMap";
import { Logo } from "@/components/Logo";

type Shop = { id: number; shop: string; name: string; tier: string; rating: number; km: number; eta_min: number; lat: number; lng: number; tubeless_certified: boolean };
type Fleet = { name: string; city: string; riders: number; plan: string; monthly_fee_inr: number; jobs_30d: number; avg_downtime_min: number; downtime_saved_hrs: number };

const HOME = { lat: 18.5204, lng: 73.8567 };
const TIER_C: Record<string, string> = { Apprentice: "#9CA3AF", Craftsman: "#38BDF8", Master: "#FFB020", Grandmaster: "#FF5A1F" };

export default function Rider() {
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [stage, setStage] = useState<"idle" | "searching" | "found" | "waiting" | "enroute" | "fixed" | "rated">("idle");
  const [sosId, setSosId] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<{ kind: string; from: string; at: string; text: string; link: string }[]>([]);
  const [stars, setStars] = useState(5);
  const [fleet, setFleet] = useState<Fleet | null>(null);
  const [serial, setSerial] = useState("");

  useEffect(() => {
    api<Fleet[]>("/api/fleets").then((f) => setFleet(f.find((x) => x.city === "Pune") ?? f[0])).catch(() => {});
    api<{ serial: string }>("/api/rider/sample-serial").then((r) => setSerial(r.serial)).catch(() => {});
    const load = () => api<typeof msgs>("/api/rider/messages?name=Priya").then(setMsgs).catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  // Poll the SOS so the mechanic's accept / done buttons show up here live.
  useEffect(() => {
    if (!sosId || stage === "fixed" || stage === "rated") return;
    const t = setInterval(async () => {
      const r = await api<{ status: string }>(`/api/sos/${sosId}`);
      if (r.status === "accepted") setStage("enroute");
      if (r.status === "fixed") setStage("fixed");
    }, 2500);
    return () => clearInterval(t);
  }, [sosId, stage]);

  async function request() {
    if (!pick) return;
    const r = await post<{ id: number }>("/api/sos/request", { mechanic_id: pick, ...HOME, rider_name: "Priya" });
    setSosId(r.id); setStage("waiting");
  }
  async function markFixed() {
    if (sosId) await post(`/api/sos/${sosId}/fixed`, {}).catch(() => {});
    setStage("fixed");
  }

  async function sos() {
    setStage("searching"); setPick(null);
    const [r] = await Promise.all([post<Shop[]>("/api/sos", HOME), new Promise((res) => setTimeout(res, 1600))]);
    setShops(r); setPick(r[0].id); setStage("found");
  }
  const chosen = shops?.find((s) => s.id === pick);

  async function rate() {
    if (!chosen) return;
    await post("/api/rider/rate", { mechanic_id: chosen.id, stars, comment: "Rescued my delivery shift" });
    setStage("rated");
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Link href="/"><Logo className="text-lg" /></Link>
        <Link href="/personas" className="btn-ghost">Personas</Link>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky font-display text-lg font-black text-ink">PN</span>
        <div>
          <p className="eyebrow !text-sky">Rider persona</p>
          <h1 className="font-display text-3xl font-bold">Priya Nair</h1>
          <p className="text-sm text-bone-dim">Delivery rider on an Activa · Pune · Fleet Pit Pass member</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* SOS */}
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-bold">Puncture SOS</p>
              <p className="text-sm text-bone-dim">Flat tyre mid-shift? Find the nearest Guild shop.</p>
            </div>
            <Siren className="h-6 w-6 text-rose" />
          </div>
          <div className="mt-5">
            <RadarMap center={HOME} selected={pick} onSelect={setPick}
              points={(shops ?? []).map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: `${s.km} km`, color: TIER_C[s.tier] }))} />
          </div>

          <AnimatePresence mode="wait">
            {stage === "idle" || stage === "searching" ? (
              <motion.button key="b" onClick={sos} disabled={stage === "searching"} exit={{ opacity: 0 }}
                className="btn mt-5 w-full bg-rose py-4 text-base text-white shadow-[0_0_40px_-6px_#F43F5E]">
                <Siren className="h-5 w-5" /> {stage === "searching" ? "Scanning nearby Guild shops…" : "I have a flat tyre"}
              </motion.button>
            ) : (
              <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-2">
                {shops!.map((s, i) => (
                  <button key={s.id} onClick={() => setPick(s.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${pick === s.id ? "border-volt bg-volt/5" : "border-white/5 bg-ink-700"}`}>
                    <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-ink" style={{ background: TIER_C[s.tier] }}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.shop}</p>
                      <p className="text-[11px] text-bone-dim">{s.tier} · ★ {s.rating} {s.tubeless_certified && "· Tubeless certified"}</p>
                    </div>
                    <div className="text-right text-xs"><p className="font-mono">{s.km} km</p><p className="text-bone-mute">{s.eta_min} min</p></div>
                  </button>
                ))}
                {stage === "found" && <button onClick={request} className="btn-primary w-full py-3">Send SOS to {chosen?.name.split(" ")[0]} — Pit Pass priority</button>}
                {stage === "waiting" && (
                  <div className="rounded-2xl bg-amber/10 p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 animate-ping rounded-full bg-amber" /> Waiting for {chosen?.shop} to accept…</p>
                    <p className="mt-1 text-xs text-bone-dim">The lead is now in the mechanic&apos;s app. Try it: open <a href={`/app?persona=ravi`} target="_blank" className="text-molten underline">Ravi&apos;s app</a> → Inbox → Accept.</p>
                  </div>
                )}
                {stage === "enroute" && (
                  <div className="rounded-2xl bg-volt/10 p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" /> {chosen?.name} is on the way · ETA {chosen?.eta_min} min</p>
                    <button onClick={markFixed} className="btn-ghost mt-3 w-full">Mark as fixed</button>
                  </div>
                )}
                {stage === "fixed" && (
                  <div className="rounded-2xl bg-ink-700 p-4">
                    <p className="text-sm font-semibold">Rate {chosen?.shop}</p>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}><Star className={`h-7 w-7 ${n <= stars ? "fill-amber text-amber" : "text-bone-mute"}`} /></button>)}
                    </div>
                    <button onClick={rate} className="btn-primary mt-3 w-full">Submit rating</button>
                  </div>
                )}
                {stage === "rated" && <p className="rounded-2xl bg-volt/10 p-4 text-sm">⭐ Thanks! Your rating is live on the <a href={`/board/${chosen?.id}`} className="underline">shop&apos;s Living Shop Board</a> and feeds its Guild Score.</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="space-y-6">
          {fleet && (
            <section className="relative overflow-hidden rounded-3xl border border-sky/30 bg-gradient-to-br from-sky/20 to-ink-800 p-5">
              <p className="eyebrow !text-sky">Fleet Pit Pass</p>
              <p className="mt-2 font-display text-2xl font-bold">{fleet.name} · {fleet.plan}</p>
              <p className="text-sm text-bone-dim">Your fleet pays ₹{fleet.plan === "Pro" ? 39 : 19}/rider/month. You get priority at every Guild shop.</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-ink/60 p-3"><p className="font-display text-xl font-black">{fleet.riders}</p><p className="text-[10px] text-bone-mute">Riders</p></div>
                <div className="rounded-xl bg-ink/60 p-3"><p className="font-display text-xl font-black">{fleet.avg_downtime_min}m</p><p className="text-[10px] text-bone-mute">Avg downtime</p></div>
                <div className="rounded-xl bg-ink/60 p-3"><p className="font-display text-xl font-black">{fleet.downtime_saved_hrs}h</p><p className="text-[10px] text-bone-mute">Saved / 30d</p></div>
              </div>
              <p className="mt-3 text-[11px] text-bone-mute">Why it matters: gig riders lose earnings for every hour off the road. Fleets fund the pass; Guild mechanics get guaranteed volume.</p>
            </section>
          )}

          <section className="card p-5">
            <p className="flex items-center gap-2 font-display text-xl font-bold"><ShieldCheck className="h-5 w-5 text-volt" /> Is my tyre genuine?</p>
            <p className="text-sm text-bone-dim">Scan the tyre QR to see its Tyre Twin: fitment, wear history and warranty.</p>
            <div className="mt-4 flex gap-2">
              <input value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-700 px-4 py-3 font-mono text-sm outline-none focus:border-molten" />
              <Link href={`/twin?serial=${serial}`} className="btn-primary">Open twin</Link>
            </div>
            <Link href="/twin?serial=EGFAKE000000" className="mt-2 inline-block text-xs text-bone-mute underline">Try a counterfeit serial</Link>
          </section>

          <section className="card p-5">
            <p className="flex items-center gap-2 font-semibold"><Bike className="h-5 w-5 text-molten" /> Priya&apos;s WhatsApp from Guild shops</p>
            <div className="mt-3 space-y-2">
              {msgs.length === 0 && (
                <p className="rounded-2xl bg-ink-700 p-3 text-xs text-bone-dim">
                  Nothing yet. In <a href="/app?persona=ravi" target="_blank" className="text-molten underline">Ravi&apos;s app</a>, save a TreadLens card for &quot;Priya&quot; or send her a Boomerang reminder from the Inbox. It lands here.
                </p>
              )}
              {msgs.map((m, i) => (
                <a key={i} href={m.link} className="block rounded-2xl rounded-tl-sm bg-[#202C33] p-3 text-sm">
                  <p className="text-[11px] font-semibold text-[#25D366]">{m.from}</p>
                  {m.text}
                  <p className="mt-1 text-right text-[10px] text-bone/50">{m.kind === "card" ? "Tyre health card" : "Customer Boomerang"} · {new Date(m.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </a>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-bone-dim"><BadgeCheck className="h-4 w-4 text-amber" /> Reminders send the rider back to the same mechanic, not to a competitor.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
