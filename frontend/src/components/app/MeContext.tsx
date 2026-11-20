"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";

export const MECHANIC_PERSONAS = ["ravi", "gurpreet", "imran", "lakshmi"] as const;

type Ctx = {
  me: Profile | null;
  error: string | null;
  persona: string;
  setPersona: (p: string) => void;
  refresh: () => Promise<void>;
};
const MeCtx = createContext<Ctx>({ me: null, error: null, persona: "ravi", setPersona: () => {}, refresh: async () => {} });

function initialPersona() {
  if (typeof window === "undefined") return "ravi";
  const q = new URLSearchParams(window.location.search).get("persona");
  if (q && (MECHANIC_PERSONAS as readonly string[]).includes(q)) return q;
  try { return localStorage.getItem("gg-persona") ?? "ravi"; } catch { return "ravi"; }
}

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState("ravi");
  const [me, setMe] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setPersonaState(initialPersona()); }, []);

  const refresh = useCallback(async () => {
    try {
      setMe(await api<Profile>(`/api/mechanics/me?persona=${persona}`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [persona]);

  useEffect(() => { refresh(); }, [refresh]);

  const setPersona = (p: string) => {
    setMe(null);
    setPersonaState(p);
    try { localStorage.setItem("gg-persona", p); } catch {}
  };

  return <MeCtx.Provider value={{ me, error, persona, setPersona, refresh }}>{children}</MeCtx.Provider>;
}

export const useMe = () => useContext(MeCtx);
