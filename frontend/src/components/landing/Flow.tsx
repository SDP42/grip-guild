"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  { t: "Rider walks in", d: "Worn tyre, puncture or SOS lead from the Guild map." },
  { t: "TreadLens check", d: "20-second tread & pressure check → health card on the rider's WhatsApp." },
  { t: "Fit or refer", d: "Stocked, Ghost Shelf or referral code — every path is verified." },
  { t: "+60 pts, 30 to the EMI", d: "Half the points pay off the shop's tyre changer." },
  { t: "Rider boomerangs back", d: "A reminder sends the rider back to the same shop at replacement time." },
  { t: "Eurogrip sees the lift", d: "Scan, referral and share data roll into the Lift Engine." },
];

export default function Flow() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const len = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative mx-auto max-w-5xl px-4 py-28 sm:px-6">
      <p className="eyebrow text-center">How one fitment compounds</p>
      <h2 className="h-display mt-3 text-center text-4xl sm:text-6xl">One tyre. <span className="gradient-molten">Six wins.</span></h2>
      <div className="relative mt-16">
        <svg className="absolute left-5 top-0 h-full w-2 sm:left-1/2 sm:-translate-x-1/2" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden>
          <line x1="1" y1="0" x2="1" y2="100" stroke="#20242C" strokeWidth="2" />
          <motion.line x1="1" y1="0" x2="1" y2="100" stroke="#FF5A1F" strokeWidth="2" style={{ pathLength: len }} />
        </svg>
        <ol className="space-y-12">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.t}
              initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6 }}
              className={`relative pl-14 sm:w-1/2 sm:pl-0 ${i % 2 ? "sm:ml-auto sm:pl-12" : "sm:pr-12 sm:text-right"}`}
            >
              <span className={`absolute left-[9px] top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-molten bg-ink font-mono text-[10px] text-molten sm:left-auto ${i % 2 ? "sm:-left-3" : "sm:-right-3"}`}>{i + 1}</span>
              <h3 className="font-display text-xl font-bold">{s.t}</h3>
              <p className="mt-1 text-bone-dim">{s.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
