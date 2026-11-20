"use client";

import { motion } from "framer-motion";

const COLORS = ["#FF5A1F", "#FFB020", "#C6FF3D", "#38BDF8", "#F4F1EA"];

/** Lightweight confetti burst — no dependency. */
export default function Burst({ count = 36 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const d = 120 + Math.random() * 140;
        return (
          <motion.span key={i} className="absolute left-1/2 top-1/2 h-2 w-1.5 rounded-sm"
            style={{ background: COLORS[i % COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 80, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
            transition={{ duration: 1.3 + Math.random() * 0.5, ease: [0.1, 0.7, 0.3, 1] }} />
        );
      })}
    </div>
  );
}
