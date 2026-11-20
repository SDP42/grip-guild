import Link from "next/link";
import { Logo } from "./Logo";

export default function PersonaHeader({ initials, color, kind, name, sub }: { initials: string; color: string; kind: string; name: string; sub: string }) {
  return (
    <>
      <header className="flex items-center justify-between">
        <Link href="/"><Logo className="text-lg" /></Link>
        <Link href="/personas" className="btn-ghost">Personas</Link>
      </header>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl font-display text-lg font-black text-ink" style={{ background: color }}>{initials}</span>
        <div>
          <p className="eyebrow" style={{ color }}>{kind} persona</p>
          <h1 className="font-display text-3xl font-bold">{name}</h1>
          <p className="text-sm text-bone-dim">{sub}</p>
        </div>
      </div>
    </>
  );
}
