export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-black tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <circle cx="16" cy="16" r="14" fill="none" stroke="#F4F1EA" strokeWidth="3.2" strokeDasharray="4 2.2" />
        <circle cx="16" cy="16" r="8.5" fill="none" stroke="#FF5A1F" strokeWidth="2.4" />
        <circle cx="16" cy="16" r="2.6" fill="#FF5A1F" />
      </svg>
      <span>
        GRIP<span className="text-molten">GUILD</span>
      </span>
    </span>
  );
}
