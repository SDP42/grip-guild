import Link from "next/link";
import type { Metadata } from "next";
import PersonaGrid from "@/components/PersonaGrid";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Grip Guild · Choose a persona" };

export default function Personas() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/"><Logo className="text-lg" /></Link>
      <p className="eyebrow mt-14">Eight people, one ecosystem</p>
      <h1 className="h-display mt-3 text-5xl sm:text-7xl">Step into the <span className="gradient-molten">Guild.</span></h1>
      <p className="mt-5 max-w-2xl text-bone-dim">
        Advocacy only works if every side wins. Pick a persona and run the program from their seat: the mechanic who earns tools,
        the rider who gets rescued, the dealer who gets sales, the field officer who gets told where to go, and the brand team that sees it all.
      </p>
      <div className="mt-12"><PersonaGrid /></div>
    </main>
  );
}
