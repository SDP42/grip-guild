"use client";

import { useEffect, useRef, useState } from "react";

/** Custom tyre cursor with a lagging ring that snaps to buttons/links. Pointer devices only. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const pos = { x: -100, y: -100 }, lag = { x: -100, y: -100 };
    let hover: DOMRect | null = null;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX; pos.y = e.clientY;
      const el = (e.target as HTMLElement).closest("a,button");
      hover = el ? el.getBoundingClientRect() : null;
    };
    let raf = 0;
    const loop = () => {
      const tx = hover ? hover.left + hover.width / 2 : pos.x;
      const ty = hover ? hover.top + hover.height / 2 : pos.y;
      lag.x += (tx - lag.x) * 0.18; lag.y += (ty - lag.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ring.current) {
        const w = hover ? hover.width + 14 : 34, h = hover ? hover.height + 14 : 34;
        ring.current.style.transform = `translate(${lag.x - w / 2}px, ${lag.y - h / 2}px)`;
        ring.current.style.width = `${w}px`; ring.current.style.height = `${h}px`;
        ring.current.style.borderRadius = hover ? "999px" : "50%";
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    document.documentElement.classList.add("gg-cursor");
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); document.documentElement.classList.remove("gg-cursor"); };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[90] border border-molten/70 mix-blend-difference transition-[width,height,border-radius] duration-200" />
      <div ref={dot} className="pointer-events-none fixed -left-1 -top-1 z-[91] h-2 w-2 rounded-full bg-molten" />
    </>
  );
}
