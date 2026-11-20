"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { heroScroll } from "@/lib/scroll";

const HeroScene = dynamic(() => import("../three/HeroScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      heroScroll.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      heroScroll.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (s) => (heroScroll.progress = s.progress),
      });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.to(".hero-copy", { y: -120, opacity: 0, filter: "blur(8px)", duration: 0.35 }, 0)
        .to(".hero-meta", { opacity: 0, duration: 0.2 }, 0)
        .fromTo(".hero-tagline", { opacity: 0, scale: 0.55, letterSpacing: "0.4em" },
          { opacity: 1, scale: 1, letterSpacing: "-0.02em", duration: 0.3 }, 0.42)
        .to(".hero-tagline", { scale: 1.35, opacity: 0, duration: 0.2 }, 0.8)
        .fromTo(".hero-iris", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.85);
    }, root);

    return () => {
      window.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0"><HeroScene /></div>
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#07080A_0%,rgba(7,8,10,.85)_30%,transparent_62%)] sm:block" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#07080A_0%,rgba(7,8,10,.92)_48%,rgba(7,8,10,.35)_68%,transparent_82%)] sm:hidden" />

        <div className="hero-copy absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-20 sm:justify-center sm:px-6 sm:pb-0">
          <span className="chip mb-4 w-fit sm:mb-6">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full bg-volt" /><span className="relative h-2 w-2 rounded-full bg-volt" /></span>
            Eurogrip TORQ 4.0 · Case Study 4
          </span>
          <h1 className="h-display max-w-2xl text-[10.5vw] sm:text-6xl lg:text-7xl">
            Mechanics don&apos;t need cash.
            <br />
            <span className="gradient-molten">They need a Guild.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-bone-dim sm:mt-6 sm:text-lg">
            Grip Guild turns India&apos;s two-wheeler mechanics and puncture shops into Eurogrip advocates by giving them
            the three things that actually grow their business: <b className="text-bone">tools, customers and status</b>.
          </p>
          <div className="pointer-events-auto mt-6 flex flex-wrap gap-3 sm:mt-8">
            <a href="/app" className="btn-primary">Try the mechanic app</a>
            <a href="#insight" className="btn-ghost">See the strategy</a>
          </div>
        </div>

        <div className="hero-meta absolute bottom-6 left-0 right-0 mx-auto flex max-w-7xl items-end justify-between px-4 font-mono text-[11px] uppercase tracking-[0.2em] text-bone-mute sm:px-6">
          <span>Scroll to spin up</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
          <span className="hidden sm:inline">Tools · Customers · Status</span>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h2 className="hero-tagline h-display text-center text-[11vw] opacity-0 sm:text-8xl">
            Tools<span className="text-molten">.</span> Customers<span className="text-molten">.</span>
            <br />Status<span className="text-molten">.</span>
          </h2>
        </div>
        <div className="hero-iris pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#07080A_0%,#07080A_100%)] opacity-0" />
      </div>
    </section>
  );
}
