const WORDS = [
  "Tools not cash", "Customers not coupons", "Status not stickers", "Measured, not guessed",
  "Zero inventory selling", "Every tyre has a twin", "Built for the puncture shop", "Join the Guild",
];

export default function Marquee() {
  return (
    <div className="overflow-hidden py-6">
    <div className="relative -mx-4 -rotate-2 border-y border-white/10 bg-molten py-4 text-ink">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl font-black uppercase sm:text-3xl">
        {[...WORDS, ...WORDS].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w} <span aria-hidden>✺</span>
          </span>
        ))}
      </div>
    </div>
    </div>
  );
}
