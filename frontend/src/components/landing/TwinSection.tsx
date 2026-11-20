"use client";
import Scramble from "../fx/Scramble";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

const TyreTwin = dynamic(() => import("../three/TyreTwin"), { ssr: false });

const STEPS = [
  { t: "A live record for every tyre", d: "Every Guild fitment registers the serial, the vehicle and the mechanic. The tyre now has a twin." },
  { t: "See inside the tyre", d: "Tread, belt, carcass, bead and rim separate as you scroll — the mechanic can explain the tyre to the rider." },
  { t: "Wear you can see", d: "Every TreadLens check updates the heatmap. Red zones tell the rider why, and when, to replace." },
];

export default function TwinSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", setP);
  const exploded = Math.min(1, Math.max(0, (p - 0.3) / 0.3));
  const heatmap = p > 0.62;
  const step = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 grid h-screen grid-rows-[40vh_1fr] overflow-hidden lg:grid-cols-[1fr_1.3fr] lg:grid-rows-1 lg:items-center">
        <div className="relative z-10 row-start-2 mx-auto max-w-xl self-start px-4 sm:px-6 lg:row-start-1 lg:self-auto lg:ml-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          <p className="eyebrow"><Scramble text="Eurogrip's blind spot, fixed" /></p>
          <h2 className="h-display mt-2 text-3xl sm:mt-3 sm:text-6xl">Every tyre<br />gets a <span className="gradient-molten">twin.</span></h2>
          <div className="mt-5 space-y-3 sm:mt-10 sm:space-y-6">
            {STEPS.map((s, i) => (
              <div key={s.t} className={`border-l-2 pl-5 transition-all duration-500 ${i === step ? "border-molten opacity-100" : "border-white/10 opacity-35"}`}>
                <p className="font-display text-base font-bold sm:text-xl">{s.t}</p>
                <p className={`mt-1 text-sm text-bone-dim ${i === step ? "" : "hidden sm:block"}`}>{s.d}</p>
              </div>
            ))}
          </div>
          <Link href="/twin" className="btn-primary mt-6 sm:mt-10">Open a live Tyre Twin</Link>
        </div>
        <div className="relative row-start-1 h-full lg:col-start-2 lg:h-full">
          <TyreTwin exploded={exploded} heatmap={heatmap} wear={0.55} pattern="edges" controls={false} />
        </div>
      </div>
    </section>
  );
}
