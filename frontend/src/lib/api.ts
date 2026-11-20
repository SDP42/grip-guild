export const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Free-tier hosts (e.g. Render) sleep after inactivity and take up to a minute to wake.
 * Network failures are retried with backoff, and a "waking" event lets the UI show a banner.
 */
const RETRIES = 8;
let pending = 0;
const emit = (waking: boolean) => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("gg-waking", { detail: waking }));
};

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${API}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        cache: "no-store",
      });
    } catch (e) {
      // Server asleep or unreachable: retry with backoff (≈ 70 s total).
      if (attempt >= RETRIES) { if (--pending <= 0) { pending = 0; emit(false); } throw e; }
      if (attempt === 0) { pending++; emit(true); }
      await new Promise((r) => setTimeout(r, Math.min(12000, 1500 * 2 ** attempt)));
      continue;
    }
    if (attempt > 0 && --pending <= 0) { pending = 0; emit(false); }
    if (res.status === 502 || res.status === 503) {
      // Proxy is up but the app is still booting.
      if (attempt < RETRIES) { if (attempt === 0) { pending++; emit(true); } await new Promise((r) => setTimeout(r, 3000)); continue; }
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ?? `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }
}

export const post = <T = unknown>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const fmt = (n: number) => n.toLocaleString("en-IN");
