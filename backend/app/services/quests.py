"""Seasonal Quests — time-boxed missions that keep engagement alive after sign-up."""
from datetime import datetime

QUESTS = [
    {"slug": "monsoon-grip", "title": "Monsoon Grip Drive", "season": "Jun–Sep",
     "goal": "Run 25 TreadLens checks on worn tyres", "metric": "tread_checks", "target": 25,
     "reward": "500 pts + rain-ready shop banner", "points": 500, "color": "#38BDF8"},
    {"slug": "festive-ride", "title": "Festive Ride Safe", "season": "Oct–Nov",
     "goal": "Verify 15 Eurogrip fitments before Diwali", "metric": "fitments", "target": 15,
     "reward": "400 pts + double EMI week on your tool", "points": 400, "color": "#FFB020"},
    {"slug": "ev-pioneer", "title": "EV Pioneer", "season": "Always on",
     "goal": "Fit 5 tyres on electric scooters", "metric": "ev_fitments", "target": 5,
     "reward": "350 pts + EV Ready badge", "points": 350, "color": "#C6FF3D"},
    {"slug": "word-of-mouth", "title": "Word of Mouth", "season": "Monthly",
     "goal": "Get 5 referral codes redeemed", "metric": "redeemed", "target": 5,
     "reward": "300 pts + Circle shout-out", "points": 300, "color": "#FF5A1F"},
]


def progress(metrics: dict, claimed: set[str] | None = None) -> list[dict]:
    claimed = claimed or set()
    out = []
    for q in QUESTS:
        cur = metrics.get(q["metric"], 0)
        out.append({**q, "current": min(cur, q["target"]), "pct": round(100 * min(1, cur / q["target"])),
                    "done": cur >= q["target"], "claimed": q["slug"] in claimed})
    return out


def current_season(now: datetime) -> str:
    return "festive-ride" if now.month in (10, 11) else "monsoon-grip" if 6 <= now.month <= 9 else "word-of-mouth"
