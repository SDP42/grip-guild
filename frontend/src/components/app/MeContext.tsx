"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Inbox, Profile } from "@/lib/types";

export const MECHANIC_PERSONAS = ["ravi", "gurpreet", "imran", "lakshmi"] as const;

type Ctx = {
  me: Profile | null;
  inbox: Inbox | null;
  error: string | null;
  persona: string;
  setPersona: (p: string) => void;
  refresh: () => Promise<void>;
};
const MeCtx = createContext<Ctx>({ me: null, inbox: null, error: null, persona: "ravi", setPersona: () => {}, refresh: async () => {} });

function initialPersona() {
  if (typeof window === "undefined") return "ravi";
  const q = new URLSearchParams(window.location.search).get("persona");
  if (q && (MECHANIC_PERSONAS as readonly string[]).includes(q)) return q;
  try { return localStorage.getItem("gg-persona") ?? "ravi"; } catch { return "ravi"; }
}

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<string | null>(null);
  const [me, setMe] = useState<Profile | null>(null);
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = initialPersona();
    setPersonaState(p);
    try { localStorage.setItem("gg-persona", p); } catch {}
  }, []);

  const refresh = useCallback(async () => {
    if (!persona) return;
    try {
      const prof = await api<Profile>(`/api/mechanics/me?persona=${persona}`);
      setMe(prof);
      setInbox(await api<Inbox>(`/api/mechanics/${prof.mechanic.id}/inbox`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [persona]);

  useEffect(() => { refresh(); }, [refresh]);

  // Live: poll the inbox so SOS leads, dealer sales and order updates appear without reloading.
  useEffect(() => {
    if (!me) return;
    const id = setInterval(() => {
      api<Inbox>(`/api/mechanics/${me.mechanic.id}/inbox`).then(setInbox).catch(() => {});
    }, 4000);
    return () => clearInterval(id);
  }, [me]);

  const setPersona = (p: string) => {
    setMe(null); setInbox(null);
    setPersonaState(p);
    try { localStorage.setItem("gg-persona", p); } catch {}
  };

  return <MeCtx.Provider value={{ me, inbox, error, persona: persona ?? "ravi", setPersona, refresh }}>{children}</MeCtx.Provider>;
}

export const useMe = () => useContext(MeCtx);
