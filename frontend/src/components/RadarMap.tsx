"use client";

import { motion } from "framer-motion";

type Pt = { id: number; lat: number; lng: number; label: string; color?: string };

/** Lightweight radar-style map: projects lat/lng around a centre point. No tiles, no API keys. */
export default function RadarMap({ center, points, selected, onSelect, radiusKm = 5 }:
  { center: { lat: number; lng: number }; points: Pt[]; selected?: number | null; onSelect?: (id: number) => void; radiusKm?: number }) {
  const kmPerDegLat = 111;
  const kmPerDegLng = 111 * Math.cos((center.lat * Math.PI) / 180);
  const proj = (p: { lat: number; lng: number }) => {
    const x = ((p.lng - center.lng) * kmPerDegLng) / radiusKm;
    const y = -((p.lat - center.lat) * kmPerDegLat) / radiusKm;
    const r = Math.hypot(x, y);
    const k = r > 0.92 ? 0.92 / r : 1;
    return { x: 50 + x * k * 50, y: 50 + y * k * 50 };
  };
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[radial-gradient(circle,#101a22,#07080A_70%)]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {[15, 30, 45].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#38BDF8" strokeOpacity=".15" strokeWidth=".3" />)}
        <line x1="50" y1="2" x2="50" y2="98" stroke="#38BDF8" strokeOpacity=".1" strokeWidth=".3" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="#38BDF8" strokeOpacity=".1" strokeWidth=".3" />
        {/* fake streets */}
        {[[8, 30, 92, 38], [12, 70, 88, 62], [30, 6, 38, 94], [66, 8, 60, 92]].map(([a, b, c, d], i) => (
          <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#F4F1EA" strokeOpacity=".06" strokeWidth="1.6" strokeLinecap="round" />
        ))}
        <g className="origin-center animate-[spin_4s_linear_infinite]" style={{ transformOrigin: "50px 50px" }}>
          <path d="M50 50 L50 5 A45 45 0 0 1 82 18 Z" fill="url(#sweep)" />
        </g>
        <defs>
          <radialGradient id="sweep" cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#38BDF8" stopOpacity=".0" /><stop offset="1" stopColor="#38BDF8" stopOpacity=".28" />
          </radialGradient>
        </defs>
        {points.map((p) => {
          const { x, y } = proj(p);
          return selected === p.id ? (
            <motion.line key={`l${p.id}`} x1="50" y1="50" x2={x} y2={y} stroke="#C6FF3D" strokeWidth=".6" strokeDasharray="1.5 1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
          ) : null;
        })}
      </svg>
      <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky shadow-[0_0_20px_#38BDF8]">
        <span className="absolute inset-0 animate-pulseRing rounded-full bg-sky" />
      </span>
      {points.map((p, i) => {
        const { x, y } = proj(p);
        const on = selected === p.id;
        return (
          <motion.button key={p.id} onClick={() => onSelect?.(p.id)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 * i, type: "spring" }}
            className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className={`grid h-8 w-8 place-items-center rounded-full border-2 text-[10px] font-black text-ink ${on ? "scale-125 border-bone" : "border-ink"}`}
              style={{ background: p.color ?? "#FF5A1F" }}>{i + 1}</span>
            <span className="mt-1 block whitespace-nowrap rounded bg-ink/80 px-1.5 text-[9px]">{p.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
