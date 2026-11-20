"use client";
import Scramble from "../fx/Scramble";

import { motion } from "framer-motion";
import { Crown, Users, Wrench } from "lucide-react";

const PILLARS = [
  {
    icon: Wrench, name: "Tools", color: "#FF5A1F", line: "Grow the workshop.",
    items: [
      ["Fitments Pay Off Your Tools", "Half of every fitment's points go into an EMI on a tool the mechanic will own."],
      ["Starter kit on day one", "Tubeless kit, pressure gauge and tread gauge on joining."],
      ["Circle Tool Pools", "Big-ticket machines (nitrogen, pneumatic changer) shared by 8–10 shops."],
    ],
  },
  {
    icon: Users, name: "Customers", color: "#C6FF3D", line: "Fill the workshop.",
    items: [
      ["Puncture SOS", "Stranded riders are routed to the nearest Guild shop — the brand sends leads."],
      ["Customer Boomerang", "Every tyre is registered; the rider is nudged back to the same shop at replacement time."],
      ["Ghost Shelf", "Sell Eurogrip without stocking it — the dealer delivers to the shop in hours."],
    ],
  },
  {
    icon: Crown, name: "Status", color: "#FFB020", line: "Be the master.",
    items: [
      ["Guild ladder", "Apprentice → Craftsman → Master → Grandmaster, each with a better shop board."],
      ["Living Shop Board", "A QR on the board shows riders a verified tier, ratings and certifications."],
      ["Guild Passport", "Verified work history becomes access to credit and insurance."],
    ],
  },
];

export default function Pillars() {
  return (
    <section id="pillars" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-40">
      <div className="max-w-3xl">
        <p className="eyebrow"><Scramble text="The program" /></p>
        <h2 className="h-display mt-3 text-4xl sm:text-6xl">
          We don&apos;t pay mechanics.<br /><span className="gradient-molten">We make them more successful.</span>
        </h2>
        <p className="mt-6 text-bone-dim sm:text-lg">
          Cash schemes rent loyalty for a season. Grip Guild compounds: better tools, more customers and a
          visible reputation all keep growing as long as the mechanic stays in the Guild.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 60, rotateX: 18 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ transformPerspective: 900 }}
            className="card group relative overflow-hidden p-7"
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${p.color},transparent)` }} />
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40" style={{ background: p.color }} />
            <p.icon className="h-8 w-8" style={{ color: p.color }} />
            <h3 className="h-display mt-6 text-5xl">{p.name}</h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-bone-mute">{p.line}</p>
            <ul className="mt-8 space-y-5">
              {p.items.map(([t, d]) => (
                <li key={t} className="border-l-2 pl-4" style={{ borderColor: p.color }}>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-bone-dim">{d}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
