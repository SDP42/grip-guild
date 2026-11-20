"use client";
import Scramble from "../fx/Scramble";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  { k: "01", big: "Lukewarm", title: "Mechanics know Eurogrip — but don't push it.",
    so: "Awareness isn't the gap. Conversion is. Every feature is built to turn a known brand into a recommended one." },
  { k: "02", big: "Shelf gap", title: "Stocking lags well behind competing brands.",
    so: "Ghost Shelf lets a shop sell Eurogrip with zero inventory: the nearest dealer delivers in hours." },
  { k: "03", big: "Tools > ₹", title: "Tools & equipment now beat cash as the #1 ask.",
    so: "Fitments Pay Off Your Tools: every verified fitment pays an EMI on a tyre changer the mechanic will own." },
  { k: "04", big: "Status ↑", title: "Branded visibility is rising fast.",
    so: "A four-step Guild ladder with a Living Shop Board that riders can scan to verify the shop." },
  { k: "05", big: "Advocacy ≠ Stock", title: "Non-stockers already recommend Eurogrip.",
    so: "Referral codes credit influence itself — so the Guild rewards the word, not just the warehouse." },
];

export default function Insight() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = track.current!;
      const dist = () => el.scrollWidth - window.innerWidth + 48;
      gsap.to(el, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: 0.8,
          pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.utils.toArray<HTMLElement>(".insight-card").forEach((c, i) => {
        gsap.fromTo(c, { rotate: i % 2 ? 4 : -4, y: 40 }, {
          rotate: 0, y: 0, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=900", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="insight" ref={root} className="relative h-screen overflow-hidden">
      <div className="tread-bg absolute inset-0 opacity-60" />
      <div className="relative flex h-full flex-col justify-center">
        <div className="mx-auto mb-10 w-full max-w-7xl px-4 sm:px-6">
          <p className="eyebrow"><Scramble text="The brief, decoded" /></p>
          <h2 className="h-display mt-3 text-4xl sm:text-6xl">Five insights. <span className="text-stroke">One design.</span></h2>
        </div>
        <div ref={track} className="flex w-max gap-6 px-4 sm:px-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {CARDS.map((c) => (
            <article key={c.k} className="insight-card card relative flex h-[58vh] max-h-[460px] w-[82vw] max-w-[420px] flex-col justify-between overflow-hidden p-7">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-molten/20 blur-3xl" />
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-bone-mute">
                  <span>INSIGHT {c.k}</span><span>Eurogrip mechanic brand-track</span>
                </div>
                <p className="h-display mt-6 text-5xl text-bone">{c.big}</p>
                <p className="mt-4 text-lg font-medium text-bone">{c.title}</p>
              </div>
              <div className="border-t border-white/10 pt-5">
                <p className="eyebrow mb-2 !text-volt">So the Guild…</p>
                <p className="text-sm leading-relaxed text-bone-dim">{c.so}</p>
              </div>
            </article>
          ))}
          <div className="w-[10vw]" />
        </div>
      </div>
    </section>
  );
}
