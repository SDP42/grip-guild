"use client";

import { useEffect, useState } from "react";

/** null while checking, then whether this browser can create a WebGL context. */
export function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/** Static stand-in for the 3D tyre when WebGL is unavailable (old phones, battery saver, some in-app browsers). */
export default function GLFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <svg viewBox="0 0 200 200" className="h-[min(62vw,420px)] w-[min(62vw,420px)] animate-[spin_14s_linear_infinite] opacity-90">
        <circle cx="100" cy="100" r="86" fill="#14161B" />
        <circle cx="100" cy="100" r="86" fill="none" stroke="#2B2F36" strokeWidth="14" strokeDasharray="10 6" />
        <circle cx="100" cy="100" r="54" fill="none" stroke="#FF5A1F" strokeWidth="6" />
        <circle cx="100" cy="100" r="16" fill="#FF5A1F" />
      </svg>
    </div>
  );
}
