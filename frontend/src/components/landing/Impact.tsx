"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "../CountUp";
import { api } from "@/lib/api";

type Overview = {
  mechanics: number; active_30d: number; fitments: number; referral_conversion_pct: number;
  non_stock_advocates: number; tools_leased: number; certifications: number; sos_routed: number;
};
type Lift = { pilot_delta_pp: number; control_delta_pp: number; incremental_lift_pp: number };

const FALLBACK: Overview = { mechanics: 321, active_30d: 194, fitments: 2600, referral_conversion_pct: 58,
  non_stock_advocates: 121, tools_leased: 91, certifications: 260, sos_routed: 60 };

const BUDGET = [
  { k: "Tools & equipment", v: 40, c: "#FF5A1F" },
  { k: "Visibility & boards", v: 22, c: "#FFB020" },
  { k: "Field force & Circles", v: 18, c: "#38BDF8" },
  { k: "Academy", v: 10, c: "#C6FF3D" },
  { k: "Bot, data & tech", v: 10, c: "#A78BFA" },
];

export default function Impact() {
  const [o, setO] = useState<Overview>(FALLBACK);
  const [lift, setLift] = useState<Lift>({ pilot_delta_pp: 4.1, control_delta_pp: 0.4, incremental_lift_pp: 3.7 });
  const [live, setLive] = useState(false);

  useEffect(() => {
    api<Overview>("/api/analytics/overview").then((d) => { setO(d); setLive(true); }).catch(() => {});
    api<Lift>("/api/analytics/lift").then(setLift).catch(() => {});
  }, []);

  const stats = [
    { n: o.mechanics, l: "Shops in the pilot" },
    { n: o.fitments, l: "Verified fitments" },
    { n: o.referral_conversion_pct, l: "Referral → sale", s: "%" },
    { n: o.non_stock_advocates, l: "Non-stocking advocates" },
    { n: o.tools_leased, l: "Tools on lease" },
    { n: o.certifications, l: "Certifications issued" },
  ];

  return (
    <section id="impact" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Measurability, built in</p>
            <h2 className="h-display mt-3 text-4xl sm:text-6xl">If it isn&apos;t measured,<br />it isn&apos;t in the Guild.</h2>
          </div>
          <span className="chip">
            <span className={`h-2 w-2 rounded-full ${live ? "bg-volt" : "bg-amber"}`} />
            {live ? "Live from the pilot simulation API" : "Sample pilot data"}
          </span>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.l} className="bg-ink-900 p-6 sm:p-8">
              <p className="h-display text-4xl sm:text-6xl"><CountUp to={s.n} suffix={s.s} /></p>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-bone-mute">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-7">
            <p className="eyebrow !text-volt">Lift Engine</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Pilot vs matched control districts</h3>
            <p className="mt-1 text-sm text-bone-dim">Difference-in-differences on Eurogrip replacement share.</p>
            <div className="mt-8 space-y-5">
              {[{ l: "Pilot districts", v: lift.pilot_delta_pp, c: "#C6FF3D" }, { l: "Control districts", v: lift.control_delta_pp, c: "#7E838E" }].map((b) => (
                <div key={b.l}>
                  <div className="mb-2 flex justify-between text-sm"><span>{b.l}</span><span className="font-mono">+{b.v.toFixed(2)} pp</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-ink-600">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${(b.v / 6) * 100}%` }} viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut" }} className="h-full rounded-full" style={{ background: b.c }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 font-display text-5xl font-black text-volt">+<CountUp to={lift.incremental_lift_pp} decimals={2} /> pp</p>
            <p className="text-sm text-bone-dim">incremental share attributable to the Guild (illustrative pilot)</p>
          </div>

          <div className="card p-7">
            <p className="eyebrow">Budget logic</p>
            <h3 className="mt-2 font-display text-2xl font-bold">1.5–2% of BU revenue → ~₹25 Cr / year</h3>
            <p className="mt-1 text-sm text-bone-dim">Planning estimate. 72% goes to things mechanics keep: tools, visibility, skills.</p>
            <div className="mt-8 flex h-10 overflow-hidden rounded-xl">
              {BUDGET.map((b, i) => (
                <motion.div key={b.k} initial={{ width: 0 }} whileInView={{ width: `${b.v}%` }} viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.1 }} style={{ background: b.c }} />
              ))}
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {BUDGET.map((b) => (
                <li key={b.k} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: b.c }} />
                  <span className="text-bone-dim">{b.k}</span>
                  <span className="ml-auto font-mono">₹{((25 * b.v) / 100).toFixed(1)} Cr</span>
                </li>
              ))}
            </ul>
            <a href="/simulator" className="btn-ghost mt-8">Open the rollout simulator →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
