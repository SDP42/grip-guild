export type Tier = { name: string; min: number; color: string; board: string; perks: string[] };

export type Tool = {
  id: number; name: string; category: string; mrp_inr: number; points_cost: number;
  weekly_lease_points: number; tier_required: string; icon: string; blurb: string;
};

export type Lease = { id: number; points_paid: number; points_total: number; status: string; pct: number; tool: Tool };

export type Fitment = {
  id: number; serial: string; tyre_model: string; vehicle: string; points: number;
  channel: "stock" | "ghost_shelf" | "referral"; created_at: string;
};

export type Profile = {
  mechanic: {
    id: number; name: string; shop_name: string; language: string; tier: string; points: number;
    lifetime_points: number; streak_weeks: number; rating: number; ratings_count: number;
    stocks_eurogrip: boolean; shop_type: string; persona: string | null; circle_id: number | null;
  };
  district: { name: string; state: string };
  circle: { name: string; goal_fitments: number; progress_fitments: number; unlock_reward: string } | null;
  tier: Tier;
  next_tier: Tier | null;
  tier_progress: number;
  guild_score: { score: number; band: string; components: Record<string, number>; fraud_penalty_pct: number };
  leases: Lease[];
  certifications: { verify_code: string; score: number; module: { title: string; badge: string } }[];
  recent_fitments: Fitment[];
  fitments_total: number;
  fitments_by_channel: Record<string, number>;
  referrals: { issued: number; redeemed: number; conversion_pct: number };
  boomerang_upcoming: number;
  quests: Quest[];
  ratings: { stars: number; comment: string; created_at: string }[];
  passport: { verified_months: number; verified_fitments: number; credit_line_inr: number; insurance: string; partner: string };
};

export const TIER_COLORS: Record<string, string> = {
  Apprentice: "#9CA3AF", Craftsman: "#38BDF8", Master: "#FFB020", Grandmaster: "#FF5A1F",
};

export type Quest = {
  slug: string; title: string; season: string; goal: string; target: number; reward: string;
  color: string; current: number; pct: number; done: boolean; claimed: boolean; points: number;
};

export type Persona = {
  slug: string; kind: "mechanic" | "rider" | "dealer" | "field" | "brand"; name: string; role: string;
  hook: string; try: string[]; href: string; accent: string; shop?: string; district?: string; tier?: string;
};

export type CoachCard = { priority: number; kind: string; title: string; body: string; cta: string; href: string };
export type Coach = [{ greeting: string; unread: number }, ...CoachCard[]];

export type Notice = { id: number; kind: string; title: string; body: string; link: string; created_at: string; read: boolean };
export type SOS = { id: number; rider_name: string; distance_km: number; eta_min: number; status: string; created_at: string; lat: number; lng: number };
export type Due = { fitment_id: number; rider: string; tyre_model: string; vehicle: string; serial: string; due: string; overdue: boolean };
export type Inbox = { notifications: Notice[]; unread: number; sos: SOS[]; boomerang: Due[] };
