"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Logo } from "../Logo";

export default function Finale() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const x = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/10 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.h2 style={{ scale }} className="h-display origin-left text-[16vw] leading-[0.85] sm:text-[12vw]">
          Join the<br /><span className="gradient-molten">Guild.</span>
        </motion.h2>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/app" className="btn-primary">Mechanic app</Link>
          <Link href="/app/bot" className="btn-ghost">Guild Bot (WhatsApp)</Link>
          <Link href="/command" className="btn-ghost">Command Centre</Link>
          <Link href="/simulator" className="btn-ghost">Rollout simulator</Link>
          <Link href="/sos" className="btn-ghost">Puncture SOS</Link>
        </div>
      </div>
      <motion.p style={{ x }} className="text-stroke mt-24 whitespace-nowrap font-display text-[18vw] font-black leading-none">
        GRIP THE ROAD · GRIP THE ROAD
      </motion.p>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-8 text-xs text-bone-mute sm:px-6">
        <Logo className="text-sm" />
        <p>Concept prototype for Eurogrip TORQ Challenge 4.0 by Team Outliers: Swayam Panchal, Rishit Lahoti, Jeevesh Bodhani (AI &amp; DS, DJSCE). All data shown is simulated.</p>
      </div>
    </footer>
  );
}
