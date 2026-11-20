"use client";

import ScrollFrames from "../ScrollFrames";

const BEATS = [
  { at: 0.05, t: "Every day, a rider walks into a puncture shop.", s: "The mechanic decides which tyre goes on." },
  { at: 0.4, t: "That moment decides the brand.", s: "Not the billboard. Not the dealer. The mechanic." },
  { at: 0.72, t: "Grip Guild wins that moment.", s: "With tools, customers and status — not cash." },
];

/** Cinematic scroll film. Appears automatically once frames are generated with scripts/extract_frames.sh. */
export default function FilmStrip() {
  return (
    <ScrollFrames name="workshop" height="320vh">
      {(p) => (
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-4 pb-24 sm:px-6">
          {BEATS.map((b, i) => {
            const next = BEATS[i + 1]?.at ?? 1.05;
            const on = p >= b.at && p < next;
            return (
              <div key={b.t} className="absolute bottom-24 max-w-3xl transition-all duration-700"
                style={{ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 24}px)`, filter: on ? "none" : "blur(6px)" }}>
                <h2 className="h-display text-4xl sm:text-6xl">{b.t}</h2>
                <p className="mt-3 text-lg text-bone-dim">{b.s}</p>
              </div>
            );
          })}
        </div>
      )}
    </ScrollFrames>
  );
}
