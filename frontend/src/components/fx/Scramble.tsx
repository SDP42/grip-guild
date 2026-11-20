"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const GLYPHS = "▚▞▙▟█▓▒░<>/\\=+*#";

/** Decodes text from tread-glyph noise when it scrolls into view. */
export default function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setOut(text.split("").map((ch, i) => (ch === " " || i < frame / 2 ? ch : GLYPHS[(i + frame) % GLYPHS.length])).join(""));
      if (frame / 2 > text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [inView, text]);
  return <span ref={ref} className={className}>{out}</span>;
}
