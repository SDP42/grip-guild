"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "../Logo";

export default function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 200], ["rgba(7,8,10,0)", "rgba(7,8,10,0.72)"]);
  return (
    <motion.header style={{ backgroundColor: bg }} className="fixed inset-x-0 top-0 z-50 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Grip Guild home"><Logo className="text-lg" /></Link>
        <div className="hidden items-center gap-7 text-sm text-bone-dim md:flex">
          <a href="#insight" className="hover:text-bone">Insight</a>
          <a href="#pillars" className="hover:text-bone">Program</a>
          <a href="#personas" className="hover:text-bone">Personas</a>
          <a href="#features" className="hover:text-bone">Features</a>
          <a href="#tiers" className="hover:text-bone">Tiers</a>
          <a href="#impact" className="hover:text-bone">Impact</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/command" className="btn-ghost hidden sm:inline-flex">Command Centre</Link>
          <Link href="/personas" className="btn-primary">Try it live</Link>
        </div>
      </nav>
    </motion.header>
  );
}
