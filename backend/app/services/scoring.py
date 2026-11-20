"""Guild Score — a single 0–1000 advocacy index per mechanic.

Unlike sales-only loyalty schemes, it rewards *influence* even when the
mechanic does not stock Eurogrip (redeemed referrals weigh the most).
"""
from datetime import datetime, timedelta

WEIGHTS = {
    "fitments": 0.30,       # verified Eurogrip fitments (last 90 days)
    "advocacy": 0.30,       # redeemed referrals: influence without inventory
    "rating": 0.15,         # rider ratings from the Living Shop Board
    "skill": 0.15,          # Guild Academy certifications
    "consistency": 0.10,    # weekly streak
}


def _clip(x: float) -> float:
    return max(0.0, min(1.0, x))


def guild_score(*, fitments_90d: int, redeemed_90d: int, rating: float, ratings_count: int,
                certs: int, streak_weeks: int, open_fraud: int) -> dict:
    parts = {
        "fitments": _clip(fitments_90d / 40),
        "advocacy": _clip(redeemed_90d / 20),
        "rating": _clip((rating - 3.0) / 2.0) * _clip(ratings_count / 30),
        "skill": _clip(certs / 5),
        "consistency": _clip(streak_weeks / 12),
    }
    raw = sum(parts[k] * w for k, w in WEIGHTS.items())
    penalty = min(0.4, 0.15 * open_fraud)
    score = round(1000 * raw * (1 - penalty))
    return {
        "score": score,
        "band": "Elite" if score >= 750 else "Strong" if score >= 500 else "Rising" if score >= 250 else "New",
        "components": {k: round(v * 100) for k, v in parts.items()},
        "weights": WEIGHTS,
        "fraud_penalty_pct": round(penalty * 100),
    }


def since(days: int, now: datetime) -> datetime:
    return now - timedelta(days=days)
