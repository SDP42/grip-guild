"""Nudge Engine — spots mechanics drifting away before they churn.

Signals: activity drop vs their own baseline, broken streak, stalled tool EMI,
issued-but-unredeemed referrals. Each risk comes with the cheapest next action.
"""
from datetime import datetime, timedelta


def churn_risk(*, fitments_prev_30: int, fitments_last_30: int, streak_weeks: int, lease_pct: int | None,
               open_referrals: int, days_since_join: int) -> dict:
    reasons, score = [], 0.0
    if fitments_prev_30 >= 3:
        drop = 1 - fitments_last_30 / max(1, fitments_prev_30)
        if drop > 0.4:
            score += 0.45 * min(1, drop)
            reasons.append(f"Fitments down {round(drop * 100)}% vs previous month")
    if streak_weeks == 0 and days_since_join > 21:
        score += 0.2
        reasons.append("Weekly streak broken")
    if lease_pct is not None and lease_pct < 35:
        score += 0.15
        reasons.append(f"Tool EMI stuck at {lease_pct}%")
    if open_referrals >= 3:
        score += 0.15
        reasons.append(f"{open_referrals} referrals issued but not redeemed")
    if days_since_join <= 14 and fitments_last_30 == 0:
        score += 0.3
        reasons.append("New member with no first fitment yet")
    score = min(1.0, score)

    if "New member" in " ".join(reasons):
        action = "Field visit: first-fitment walkthrough + starter kit check"
    elif any("EMI" in r for r in reasons):
        action = "Send a 'double EMI week' quest on WhatsApp"
    elif any("referrals" in r for r in reasons):
        action = "Ping the dealer to follow up the open referral codes"
    elif score > 0:
        action = "WhatsApp voice note from Circle mentor"
    else:
        action = "No action needed"
    level = "high" if score >= 0.55 else "medium" if score >= 0.3 else "low"
    return {"risk": round(score, 2), "level": level, "reasons": reasons, "action": action}


def window(now: datetime, days_back_start: int, days_back_end: int):
    return now - timedelta(days=days_back_start), now - timedelta(days=days_back_end)
