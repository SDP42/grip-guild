import Link from "next/link";
import { Bell, BookOpen, Boxes, Fingerprint, LayoutDashboard, MapPin, ScanLine, SlidersHorizontal, Trophy, Users, Wrench } from "lucide-react";

const LINKS = [
  { href: "/app/inbox", icon: Bell, t: "Inbox", d: "SOS leads, Boomerang reminders, activity" },
  { href: "/app/quests", icon: Trophy, t: "Seasonal Quests", d: "Missions with real rewards" },
  { href: "/app/circle", icon: Users, t: "My Guild Circle", d: "Leaderboard and shared goal" },
  { href: "/app/treadlens", icon: ScanLine, t: "TreadLens", d: "Tyre health card for riders" },
  { href: "/app/shelf", icon: Boxes, t: "Ghost Shelf", d: "Sell without stocking" },
  { href: "/app/tools", icon: Wrench, t: "Tool Store", d: "Lease-to-own equipment" },
  { href: "/app/academy", icon: BookOpen, t: "Guild Academy", d: "Certifications & badges" },
  { href: "/app/passport", icon: Fingerprint, t: "Guild Passport", d: "Credit & insurance" },
  { href: "/rider", icon: MapPin, t: "Puncture SOS (rider view)", d: "How riders find you" },
  { href: "/twin", icon: ScanLine, t: "Tyre Twin 3D", d: "Digital twin of a fitted tyre" },
  { href: "/command", icon: LayoutDashboard, t: "Command Centre", d: "Eurogrip's view" },
  { href: "/simulator", icon: SlidersHorizontal, t: "Rollout Simulator", d: "National scale-up maths" },
];

export default function More() {
  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Everything in the Guild</h1>
      <div className="mt-4 space-y-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-ink-800 p-4 active:scale-[.98]">
            <l.icon className="h-5 w-5 text-molten" />
            <div><p className="text-sm font-semibold">{l.t}</p><p className="text-[11px] text-bone-dim">{l.d}</p></div>
            <span className="ml-auto text-bone-mute">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
