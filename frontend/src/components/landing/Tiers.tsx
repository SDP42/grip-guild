"use client";
import Scramble from "../fx/Scramble";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

const TIERS = [
  { name: "Apprentice", pts: "0", color: "#9CA3AF", board: "Sticker decal + verify-QR",
    perks: ["Tubeless starter kit", "Guild Academy", "Puncture SOS listing"] },
  { name: "Craftsman", pts: "1,500", color: "#38BDF8", board: "Metal Guild plate",
    perks: ["Tool leases unlocked", "Uniform set", "Ghost Shelf ordering"] },
  { name: "Master", pts: "5,000", color: "#FFB020", board: "LED Living Shop Board",
    perks: ["Power tools & balancer", "Priority SOS leads", "Guild Passport credit"] },
  { name: "Grandmaster", pts: "12,000", color: "#FF5A1F", board: "Full shop-front makeover",
    perks: ["Pneumatic changer", "Circle mentor role", "Plant visit"] },
];

export default function Tiers() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setIdx(Math.min(3, Math.floor(v * 4))));
  const rotate = useTransform(scrollYProgress, [0, 1], [-14, 14]);
  const t = TIERS[idx];

  return (
    <section id="tiers" ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow"><Scramble text="Status you can see from the road" /></p>
            <h2 className="h-display mt-3 text-4xl sm:text-6xl">Climb the Guild.</h2>
            <ol className="mt-10 space-y-3">
              {TIERS.map((x, i) => (
                <li key={x.name} className="flex items-center gap-4">
                  <span className="h-px transition-all duration-500" style={{ width: i === idx ? 56 : 20, background: i <= idx ? x.color : "#2C313B" }} />
                  <span className={`font-display text-2xl font-bold transition-colors duration-500 sm:text-3xl ${i === idx ? "" : "text-bone-mute/50"}`}
                    style={{ color: i === idx ? x.color : undefined }}>{x.name}</span>
                  <span className="font-mono text-xs text-bone-mute">{x.pts} pts</span>
                </li>
              ))}
            </ol>
            <motion.ul key={t.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10 flex flex-wrap gap-2">
              {t.perks.map((p) => <li key={p} className="chip" style={{ borderColor: `${t.color}55`, color: t.color }}>{p}</li>)}
            </motion.ul>
          </div>

          {/* Shop front */}
          <div className="relative mx-auto aspect-[4/3.3] w-full max-w-lg" style={{ perspective: 1200 }}>
            <motion.div style={{ rotateY: rotate }} className="absolute inset-0 rounded-3xl border border-white/10 bg-ink-800 p-5 [transform-style:preserve-3d]">
              <motion.div
                key={t.name}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="relative flex h-[34%] items-center justify-between overflow-hidden rounded-xl px-5"
                style={{ background: idx >= 2 ? `linear-gradient(120deg, ${t.color}, #07080A)` : "#171A20",
                  boxShadow: idx >= 2 ? `0 0 70px -10px ${t.color}` : "none", border: `2px solid ${t.color}` }}
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80">Grip Guild · {t.name}</p>
                  <p className="font-display text-xl font-black sm:text-3xl">SAI PUNCTURE WORKS</p>
                  <p className="text-xs text-bone/80">Tubeless certified · ★ 4.8 (164 riders)</p>
                </div>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-bone p-1.5 sm:h-16 sm:w-16">
                  <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-[2px]">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <span key={i} className={(i * 7 + 3) % 3 === 0 || [0, 4, 20].includes(i) ? "bg-ink" : ""} />
                    ))}
                  </div>
                </div>
              </motion.div>
              <div className="mt-4 grid h-[56%] grid-cols-3 gap-3">
                <div className="col-span-2 rounded-xl bg-[repeating-linear-gradient(90deg,#20242C_0_12px,#171A20_12px_24px)]" />
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-xl border border-white/10 transition-colors duration-700"
                      style={{ background: i < idx + 1 ? `${t.color}22` : "#101216", borderColor: i < idx + 1 ? `${t.color}66` : undefined }} />
                  ))}
                </div>
              </div>
              <p className="absolute bottom-3 right-5 font-mono text-[10px] uppercase tracking-widest text-bone-mute">Board: {t.board}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
