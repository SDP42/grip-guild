"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bike, Briefcase, ClipboardList, Store, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import type { Persona } from "@/lib/types";

const FALLBACK: Persona[] = [
  { slug: "ravi", kind: "mechanic", name: "Ravi Kumar", role: "Puncture-shop owner", hook: "Doesn't stock Eurogrip — sells it anyway through Ghost Shelf and referrals.", try: ["Order from Ghost Shelf", "Refer a rider"], href: "/app?persona=ravi", accent: "#FFB020", shop: "Sai Puncture Works", district: "Pune", tier: "Master" },
  { slug: "gurpreet", kind: "mechanic", name: "Gurpreet Singh", role: "Grandmaster garage owner", hook: "Stocks Eurogrip, mentors a Guild Circle.", try: ["Circle leaderboard", "Seasonal Quest"], href: "/app?persona=gurpreet", accent: "#FF5A1F", shop: "Royal Two Wheeler Clinic", district: "Ludhiana", tier: "Grandmaster" },
  { slug: "imran", kind: "mechanic", name: "Imran Shaikh", role: "New Apprentice (day 6)", hook: "Just joined. One fitment from his first streak.", try: ["First scan", "Tubeless quiz"], href: "/app?persona=imran", accent: "#9CA3AF", shop: "New Star Puncture Point", district: "Lucknow", tier: "Apprentice" },
  { slug: "lakshmi", kind: "mechanic", name: "Lakshmi Reddy", role: "EV scooter specialist", hook: "Runs an EV-first garage.", try: ["EV Pioneer quest", "Passport credit"], href: "/app?persona=lakshmi", accent: "#C6FF3D", shop: "Volt Bike Care", district: "Chennai", tier: "Craftsman" },
  { slug: "priya", kind: "rider", name: "Priya Nair", role: "Gig delivery rider, Pune", hook: "A flat tyre costs her a shift. Puncture SOS finds a Guild shop in minutes.", try: ["Puncture SOS", "Tyre Twin"], href: "/rider", accent: "#38BDF8" },
  { slug: "dealer", kind: "dealer", name: "Pune Dealer", role: "Eurogrip dealer, Pune", hook: "Redeems referral codes and fulfils Ghost Shelf orders.", try: ["Redeem a code", "Dispatch an order"], href: "/dealer", accent: "#A78BFA" },
  { slug: "anita", kind: "field", name: "Anita Desai", role: "Eurogrip field officer", hook: "The Nudge Engine tells her who needs a visit today.", try: ["Today's nudges"], href: "/field", accent: "#F43F5E" },
  { slug: "brand", kind: "brand", name: "Brand Manager", role: "Eurogrip marketing", hook: "Funnel, lift vs control, fraud and budget autopilot.", try: ["Lift Engine", "Autopilot"], href: "/command", accent: "#F4F1EA" },
];

const ICON = { mechanic: Wrench, rider: Bike, dealer: Store, field: ClipboardList, brand: Briefcase };

export default function PersonaGrid() {
  const [ps, setPs] = useState<Persona[]>(FALLBACK);
  useEffect(() => { api<Persona[]>("/api/personas").then(setPs).catch(() => {}); }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ps.map((p, i) => {
        const Icon = ICON[p.kind];
        return (
          <motion.div key={p.slug} initial={{ opacity: 0, y: 40, rotateX: 20 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.7, delay: (i % 4) * 0.08 }} style={{ transformPerspective: 900 }}>
            <Link href={p.href} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-800 p-6 transition hover:-translate-y-1 hover:border-white/20">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-25 blur-3xl transition group-hover:opacity-60" style={{ background: p.accent }} />
              <div className="relative flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl font-display text-lg font-black text-ink" style={{ background: p.accent }}>
                  {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <span className="chip"><Icon className="h-3.5 w-3.5" /> {p.kind}</span>
              </div>
              <p className="relative mt-5 font-display text-xl font-bold">{p.name}</p>
              <p className="relative text-sm" style={{ color: p.accent }}>{p.role}</p>
              {p.shop && <p className="relative text-xs text-bone-mute">{p.shop} · {p.district} · {p.tier}</p>}
              <p className="relative mt-3 text-sm text-bone-dim">{p.hook}</p>
              <ul className="relative mt-4 flex flex-wrap gap-1.5">
                {p.try.map((t) => <li key={t} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-bone-dim">{t}</li>)}
              </ul>
              <span className="relative mt-auto pt-6 text-sm font-semibold transition group-hover:translate-x-1" style={{ color: p.accent }}>Play as {p.name.split(" ")[0]} →</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
