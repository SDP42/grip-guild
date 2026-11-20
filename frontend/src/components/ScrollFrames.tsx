"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

type Manifest = { count: number; ext: string; width: number; height: number };

/**
 * Apple-style scroll-scrubbed image sequence.
 * Frames live in /public/frames/<name>/0001.<ext>… with a manifest.json written by scripts/extract_frames.sh.
 * Renders nothing if the sequence hasn't been generated, so the page never breaks.
 */
export default function ScrollFrames({ name, height = "300vh", children }: { name: string; height?: string; children?: (p: number) => React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const [man, setMan] = useState<Manifest | null>(null);
  const [p, setP] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });

  useEffect(() => {
    fetch(`/frames/${name}/manifest.json`).then((r) => (r.ok ? r.json() : null)).then((m: Manifest | null) => {
      if (!m) return;
      imgs.current = Array.from({ length: m.count }, (_, i) => {
        const im = new Image();
        im.src = `/frames/${name}/${String(i + 1).padStart(4, "0")}.${m.ext}`;
        return im;
      });
      imgs.current[0].onload = () => draw(0);
      setMan(m);
    }).catch(() => {});
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  function draw(progress: number) {
    const c = canvas.current;
    const list = imgs.current;
    if (!c || !list.length) return;
    const idx = Math.min(list.length - 1, Math.floor(progress * (list.length - 1)));
    const im = list[idx];
    if (!im.complete) return;
    const ctx = c.getContext("2d")!;
    const { width: w, height: h } = c;
    const s = Math.max(w / im.naturalWidth, h / im.naturalHeight); // cover
    ctx.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
  }

  useEffect(() => {
    const resize = () => {
      if (!canvas.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.current.width = window.innerWidth * dpr;
      canvas.current.height = window.innerHeight * dpr;
      draw(scrollYProgress.get());
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [man]); // eslint-disable-line react-hooks/exhaustive-deps

  useMotionValueEvent(scrollYProgress, "change", (v) => { setP(v); requestAnimationFrame(() => draw(v)); });

  if (!man) return null;
  return (
    <section ref={wrap} className="relative" style={{ height }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        {children?.(p)}
      </div>
    </section>
  );
}
