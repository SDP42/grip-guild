"use client";

import { motion } from "framer-motion";

export default function ScoreRing({ score, size = 132, color = "#FF5A1F", label = "Guild Score" }:
  { score: number; size?: number; color?: string; label?: string }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, score / 1000);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#20242C" strokeWidth={9} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#20242C" strokeWidth={9} fill="none" strokeDasharray="2 6" opacity={0.6} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-3xl font-black">{score}</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-bone-mute">{label}</p>
        </div>
      </div>
    </div>
  );
}
