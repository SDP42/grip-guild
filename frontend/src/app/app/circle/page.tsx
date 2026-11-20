"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";
import { TIER_COLORS } from "@/lib/types";

type Member = { id: number; shop: string; name: string; tier: string; lifetime_points: number; fitments_30d: number; persona: string | null };
type Data = { circle: { name: string; goal_fitments: number; progress_fitments: number; unlock_reward: string }; members: Member[] };

export default function Circle() {
  const { me } = useMe();
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => { if (me?.mechanic.circle_id) api<Data>(`/api/circles/${me.mechanic.circle_id}/members`).then(setD); }, [me]);
  if (me && !me.mechanic.circle_id) return <p className="p-4 text-sm text-bone-dim">You&apos;re not in a Guild Circle yet. A field officer will add you after your first month.</p>;
  if (!d) return <div className="m-4 h-40 animate-pulse rounded-2xl bg-ink-700" />;
  const pct = Math.round((100 * d.circle.progress_fitments) / d.circle.goal_fitments);

  return (
    <div className="px-4 pt-4">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Users className="h-6 w-6 text-sky" /> {d.circle.name}</h1>
      <p className="text-sm text-bone-dim">8–10 nearby shops with one shared goal. Hit it together and the whole Circle unlocks a {d.circle.unlock_reward}.</p>
      <div className="card mt-4 p-4">
        <div className="flex justify-between text-sm"><span>Circle goal</span><span className="font-mono">{d.circle.progress_fitments}/{d.circle.goal_fitments}</span></div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink-600"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full bg-sky" /></div>
      </div>
      <ol className="mt-4 space-y-2">
        {d.members.map((m, i) => {
          const isMe = m.id === me?.mechanic.id;
          return (
            <motion.li key={m.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? "bg-molten/15 ring-1 ring-molten/50" : "bg-ink-800"}`}>
              <span className="w-6 text-center font-display font-black text-bone-mute">{i === 0 ? <Crown className="mx-auto h-5 w-5 text-amber" /> : i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.shop}{isMe && " (you)"}</p>
                <p className="text-[11px]" style={{ color: TIER_COLORS[m.tier] }}>{m.tier} <span className="text-bone-mute">· {m.fitments_30d} fitments this month</span></p>
              </div>
              <span className="font-mono text-xs">{m.lifetime_points.toLocaleString("en-IN")}</span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
