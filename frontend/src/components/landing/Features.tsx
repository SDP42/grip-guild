"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Activity, Boxes, BadgeCheck, CircleDollarSign, Fingerprint, MapPin, MessageCircle, Network,
  Repeat, ScanLine, ShieldAlert, UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";

type F = { icon: LucideIcon; title: string; body: string; tag: string; span?: string; accent: string };

const FEATURES: F[] = [
  { icon: MessageCircle, title: "Guild Bot on WhatsApp", tag: "Zero install",
    body: "Scan, refer, check points and tool EMI on the chat app every mechanic already uses. No download, no training.",
    span: "lg:col-span-2 lg:row-span-2", accent: "#25D366" },
  { icon: Boxes, title: "Ghost Shelf", tag: "No inventory", body: "Sell without stocking. Dealer delivers to the shop.", accent: "#FF5A1F" },
  { icon: CircleDollarSign, title: "Fitments Pay Off Your Tools", tag: "Rent-to-own", body: "Every fitment pays an EMI on a machine.", accent: "#FFB020" },
  { icon: ScanLine, title: "TreadLens", tag: "Diagnostic tool", body: "Tread + pressure check → a health card the rider receives on WhatsApp.", accent: "#38BDF8" },
  { icon: Repeat, title: "Customer Boomerang", tag: "Repeat business", body: "Registered tyres bring riders back to the same mechanic.", accent: "#C6FF3D" },
  { icon: MapPin, title: "Puncture SOS", tag: "Brand-sent leads", body: "Stranded riders routed to the nearest Guild shop.", accent: "#F43F5E" },
  { icon: BadgeCheck, title: "Living Shop Board", tag: "Verified status", body: "Board QR shows tier, ratings and certifications.", accent: "#FFB020" },
  { icon: Fingerprint, title: "Guild Passport", tag: "Financial inclusion", body: "Verified history unlocks credit lines and insurance.", span: "lg:col-span-2", accent: "#A78BFA" },
  { icon: UsersRound, title: "Guild Circles", tag: "Peer pods", body: "8–10 shops, one Grandmaster mentor, shared goals.", accent: "#38BDF8" },
  { icon: Network, title: "Influence Graph", tag: "Smart spend", body: "Find the shops whose word sells tyres — stock or not.", accent: "#C6FF3D" },
  { icon: Activity, title: "Lift Engine", tag: "True incrementality", body: "Matched pilot vs control districts measure real share gain.", accent: "#FF5A1F" },
  { icon: ShieldAlert, title: "Fraud Guard", tag: "Trust", body: "Duplicate serial, velocity and geo checks on every scan.", accent: "#F43F5E" },
];

function TiltCard({ f }: { f: F }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 18 });
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      className={`card group relative overflow-hidden p-6 ${f.span ?? ""}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: useTransform([glowX, glowY], ([x, y]) => `radial-gradient(400px circle at ${x} ${y}, ${f.accent}22, transparent 60%)`) }}
      />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10" style={{ background: `${f.accent}18` }}>
            <f.icon className="h-5 w-5" style={{ color: f.accent }} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-bone-mute">{f.tag}</span>
        </div>
        <h3 className={`mt-6 font-display font-bold ${f.span?.includes("row-span-2") ? "text-3xl sm:text-4xl" : "text-lg"}`}>{f.title}</h3>
        <p className="mt-2 text-sm text-bone-dim">{f.body}</p>
        {f.span?.includes("row-span-2") && (
          <div className="mt-auto space-y-2 pt-8 text-sm">
            <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-[#005C4B] px-4 py-2">EG7F3A91C2D0</div>
            <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-ink-600 px-4 py-2">
              ✅ Fitment verified! <b>+60 pts</b><br />🔧 30 pts went to your tyre changer EMI (78% owned)
            </div>
            <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-[#005C4B] px-4 py-2">refer a rider</div>
            <div className="w-fit rounded-2xl rounded-bl-sm bg-ink-600 px-4 py-2">🎟 Code <b>GG-K7Q2M</b> ready to forward</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">12 features, one ecosystem</p>
          <h2 className="h-display mt-3 text-4xl sm:text-6xl">Built for the<br />puncture shop.</h2>
        </div>
        <p className="max-w-md text-bone-dim">
          Every feature answers one line of the brief: scalable nationally, sustained beyond the sign-up gift,
          and measured end to end.
        </p>
      </div>
      <div className="mt-14 grid auto-rows-[minmax(200px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => <TiltCard key={f.title} f={f} />)}
      </div>
    </section>
  );
}
