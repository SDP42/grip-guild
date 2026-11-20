import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Insight from "@/components/landing/Insight";
import Pillars from "@/components/landing/Pillars";
import Features from "@/components/landing/Features";
import Tiers from "@/components/landing/Tiers";
import Flow from "@/components/landing/Flow";
import Impact from "@/components/landing/Impact";
import Finale from "@/components/landing/Finale";
import Personas from "@/components/landing/Personas";
import TwinSection from "@/components/landing/TwinSection";

export default function Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Insight />
        <Pillars />
        <Personas />
        <Features />
        <TwinSection />
        <Tiers />
        <Flow />
        <Impact />
      </main>
      <Finale />
    </SmoothScroll>
  );
}
