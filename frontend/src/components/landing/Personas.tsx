import PersonaGrid from "../PersonaGrid";

export default function Personas() {
  return (
    <section id="personas" className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <p className="eyebrow">Step inside</p>
      <h2 className="h-display mt-3 text-4xl sm:text-6xl">Pick a persona.<br /><span className="text-stroke">Play the program.</span></h2>
      <p className="mt-5 max-w-2xl text-bone-dim">Every card opens a working product, wired to the same live backend.</p>
      <div className="mt-12"><PersonaGrid /></div>
    </section>
  );
}
