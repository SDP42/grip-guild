"use client";

import { useEffect, useRef, useState } from "react";

/** Scroll speed shown as km/h, plus a scroll-progress tread strip. Hidden on small screens. */
export default function Speedometer() {
  const [kmh, setKmh] = useState(0);
  const [prog, setProg] = useState(0);
  const last = useRef({ y: 0, t: 0, v: 0 });

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      const y = window.scrollY;
      const dt = Math.max(16, t - last.current.t);
      const raw = Math.abs(y - last.current.y) / dt; // px per ms
      last.current.v = last.current.v * 0.88 + raw * 0.12;
      last.current = { y, t, v: last.current.v };
      setKmh(Math.min(180, Math.round(last.current.v * 60)));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProg(max > 0 ? y / max : 0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const a = -120 + (kmh / 180) * 240;
  return (
    <>
      <div className="fixed left-0 top-0 z-[55] h-[3px] bg-gradient-to-r from-molten via-amber to-volt" style={{ width: `${prog * 100}%` }} />
      <div className="pointer-events-none fixed bottom-5 right-5 z-[55] hidden h-24 w-24 rounded-full border border-white/10 bg-ink/70 backdrop-blur-md md:block">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {Array.from({ length: 13 }).map((_, i) => {
            const r = (-120 + i * 20) * (Math.PI / 180);
            return <line key={i} x1={50 + Math.sin(r) * 38} y1={50 - Math.cos(r) * 38} x2={50 + Math.sin(r) * 43} y2={50 - Math.cos(r) * 43}
              stroke={i > 9 ? "#F43F5E" : "#7E838E"} strokeWidth={i % 3 === 0 ? 2 : 1} />;
          })}
          <line x1="50" y1="50" x2="50" y2="16" stroke="#FF5A1F" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${a} 50 50)`}
            style={{ transition: "transform .08s linear" }} />
          <circle cx="50" cy="50" r="4" fill="#FF5A1F" />
        </svg>
        <p className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] tabular-nums text-bone">{kmh} <span className="text-bone-mute">km/h</span></p>
      </div>
    </>
  );
}
