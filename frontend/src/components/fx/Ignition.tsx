"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Ignition preloader: a rev counter sweeps to redline, then the screen tears open like tread strips. */
export default function Ignition() {
  const [rpm, setRpm] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("gg-ignition") === "1"; } catch {}
    if (seen) { setDone(true); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1500);
      setRpm(Math.round((1 - Math.pow(1 - p, 3)) * 12000));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => { setDone(true); try { sessionStorage.setItem("gg-ignition", "1"); } catch {} }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const angle = -120 + (rpm / 12000) * 240;
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[100] flex" exit={{ pointerEvents: "none" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} className="h-full flex-1 bg-ink" exit={{ y: i % 2 ? "-100%" : "100%" }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: [0.7, 0, 0.2, 1] }} />
          ))}
          <motion.div exit={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.4 }} className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <svg viewBox="0 0 200 130" className="mx-auto w-56">
                <path d="M20 115 A85 85 0 1 1 180 115" fill="none" stroke="#20242C" strokeWidth="10" strokeLinecap="round" />
                <path d="M20 115 A85 85 0 1 1 180 115" fill="none" stroke="url(#rev)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="400" strokeDashoffset={400 - (rpm / 12000) * 400} />
                <defs><linearGradient id="rev" x1="0" x2="1"><stop offset="0" stopColor="#C6FF3D" /><stop offset=".6" stopColor="#FFB020" /><stop offset="1" stopColor="#F43F5E" /></linearGradient></defs>
                <line x1="100" y1="100" x2="100" y2="35" stroke="#FF5A1F" strokeWidth="4" strokeLinecap="round" transform={`rotate(${angle} 100 100)`} />
                <circle cx="100" cy="100" r="7" fill="#FF5A1F" />
              </svg>
              <p className="font-display text-4xl font-black tabular-nums">{rpm.toLocaleString("en-IN")}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-mute">rpm · starting the Guild</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
