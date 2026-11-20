const WORDS = [
  "हर उस्ताद का गिल्ड", "Tools not cash", "ಪ್ರತಿ ಮೆಕ್ಯಾನಿಕ್", "Customers not coupons", "ஒவ்வொரு மெக்கானிக்",
  "Status not stickers", "প্রতিটি মিস্ত্রি", "Measured, not guessed", "ప్రతి మెకానిక్", "WhatsApp-first",
];

export default function Marquee() {
  return (
    <div className="relative -rotate-2 border-y border-white/10 bg-molten py-4 text-ink">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl font-black uppercase sm:text-3xl">
        {[...WORDS, ...WORDS].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w} <span aria-hidden>✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}
