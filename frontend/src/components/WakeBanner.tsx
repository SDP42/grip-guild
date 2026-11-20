"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";

/** Shows while a sleeping free-tier backend wakes up; pings the API once on load to start it early. */
export default function WakeBanner() {
  const [waking, setWaking] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setWaking((e as CustomEvent<boolean>).detail);
    window.addEventListener("gg-waking", on);
    api("/api/health").catch(() => {});
    return () => window.removeEventListener("gg-waking", on);
  }, []);
  return (
    <AnimatePresence>
      {waking && (
        <motion.div initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
          className="fixed inset-x-0 top-3 z-[120] mx-auto flex w-fit max-w-[92vw] items-center gap-3 rounded-full border border-amber/40 bg-ink/90 px-4 py-2 text-xs text-bone backdrop-blur-xl">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber border-t-transparent" />
          Waking up the Guild server (free hosting sleeps when idle). This takes up to a minute…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
