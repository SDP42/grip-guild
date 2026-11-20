"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Home, LayoutGrid, MessageCircle, ScanLine, Share2 } from "lucide-react";
import { Logo } from "../Logo";
import { MECHANIC_PERSONAS, useMe } from "./MeContext";

const TABS = [
  { href: "/app", icon: Home, label: "Home" },
  { href: "/app/refer", icon: Share2, label: "Refer" },
  { href: "/app/scan", icon: ScanLine, label: "Scan", primary: true },
  { href: "/app/bot", icon: MessageCircle, label: "Bot" },
  { href: "/app/more", icon: LayoutGrid, label: "More" },
];

export default function PhoneShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { error, me, inbox, persona, setPersona } = useMe();
  const alerts = (inbox?.unread ?? 0) + (inbox?.sos.filter((x) => x.status === "requested").length ?? 0);
  return (
    <div className="relative min-h-screen bg-ink lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10 lg:px-10">
      {/* Desktop side panel */}
      <aside className="hidden flex-col justify-center gap-6 lg:flex">
        <Link href="/"><Logo className="text-xl" /></Link>
        <h1 className="h-display text-5xl">The mechanic<br /><span className="gradient-molten">app.</span></h1>
        <p className="max-w-sm text-bone-dim">
          You are <b className="text-bone">{me?.mechanic.name ?? "…"}</b> of {me?.mechanic.shop_name ?? "…"}. Every action hits the
          live FastAPI backend: scans credit points, pay the tool EMI and show up in the Command Centre.
        </p>
        <div>
          <p className="eyebrow mb-2">Switch persona</p>
          <div className="flex flex-wrap gap-2">
            {MECHANIC_PERSONAS.map((p) => (
              <button key={p} onClick={() => setPersona(p)}
                className={`chip capitalize ${persona === p ? "!border-molten !text-molten" : ""}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/personas" className="btn-ghost">All personas</Link>
          <Link href="/command" className="btn-ghost">Command Centre →</Link>
        </div>
      </aside>

      <div className="relative mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden bg-ink-900 lg:h-[860px] lg:rounded-[52px] lg:border-[10px] lg:border-ink-600 lg:shadow-[0_40px_120px_-20px_rgba(255,90,31,.35)]">
        <div className="absolute left-1/2 top-2 z-30 hidden h-7 w-28 -translate-x-1/2 rounded-full bg-black lg:block" />
        <Link href="/app/inbox" aria-label="Inbox" className="absolute right-4 top-3 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-ink-800/90 backdrop-blur lg:top-12">
          <Bell className="h-5 w-5" />
          {alerts > 0 && (
            <motion.span key={alerts} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold">
              {alerts}
            </motion.span>
          )}
        </Link>
        <div className="no-scrollbar h-full overflow-y-auto pb-28 pt-2 lg:pt-10">
          {error && (
            <div className="mx-4 mt-4 rounded-xl border border-rose/40 bg-rose/10 p-3 text-xs text-rose">
              Backend offline — start the FastAPI server (uvicorn app.main:app) to load live data.
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={path} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        <nav className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-3xl border border-white/10 bg-ink-800/90 px-2 py-2 backdrop-blur-xl">
          {TABS.map((t) => {
            const active = t.href === "/app" ? path === "/app" : path.startsWith(t.href);
            return t.primary ? (
              <Link key={t.href} href={t.href} aria-label={t.label}
                className="-mt-8 grid h-16 w-16 place-items-center rounded-full bg-molten text-ink shadow-[0_0_30px_-4px_#ff5a1f] ring-4 ring-ink-900">
                <t.icon className="h-7 w-7" />
              </Link>
            ) : (
              <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] ${active ? "text-molten" : "text-bone-mute"}`}>
                <t.icon className="h-5 w-5" />{t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="hidden flex-col justify-center gap-3 text-sm text-bone-dim lg:flex">
        <p className="eyebrow">Try this</p>
        <ol className="list-decimal space-y-2 pl-4">
          <li>Tap <b className="text-bone">Scan</b> → verify a tyre → watch the tool EMI move.</li>
          <li>Scan the same serial twice → Fraud Guard blocks it.</li>
          <li><b className="text-bone">Refer</b> → generate a code → simulate the dealer redeeming it.</li>
          <li><b className="text-bone">Bot</b> → type &quot;hello&quot;, &quot;2&quot; or &quot;refer a rider&quot;.</li>
          <li><b className="text-bone">More → TreadLens</b> → save a health card and send it on WhatsApp.</li>
          <li>Open <a href="/rider" target="_blank" className="text-molten underline">Priya&apos;s rider view</a> in a new tab, press SOS → the lead lands in this inbox 🔔.</li>
          <li>Open the <a href="/dealer" target="_blank" className="text-molten underline">dealer view</a> and redeem your code → watch the points arrive.</li>
        </ol>
      </aside>
    </div>
  );
}
