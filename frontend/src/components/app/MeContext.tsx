"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";

type Ctx = { me: Profile | null; error: string | null; refresh: () => Promise<void> };
const MeCtx = createContext<Ctx>({ me: null, error: null, refresh: async () => {} });

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      setMe(await api<Profile>("/api/mechanics/me"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <MeCtx.Provider value={{ me, error, refresh }}>{children}</MeCtx.Provider>;
}

export const useMe = () => useContext(MeCtx);
