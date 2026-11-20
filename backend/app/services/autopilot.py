"""Budget Autopilot — moves next month's spend toward districts with the best measured lift.

Uses a simple, explainable rule: allocation ∝ max(lift, floor) × active shops,
capped at ±25% change per month so field teams can plan.
"""


def reallocate(districts: list[dict], monthly_budget_lakh: float, floor_pp: float = 0.5, cap: float = 0.25) -> list[dict]:
    if not districts:
        return []
    equal = monthly_budget_lakh / len(districts)
    weights = [max(d["lift_pp"], floor_pp) * max(d["mechanics"], 1) for d in districts]
    total = sum(weights)
    out = []
    for d, w in zip(districts, weights):
        target = monthly_budget_lakh * w / total
        new = min(equal * (1 + cap), max(equal * (1 - cap), target))
        out.append({**d, "current_lakh": round(equal, 2), "next_lakh": round(new, 2),
                    "change_pct": round(100 * (new - equal) / equal)})
    scale = monthly_budget_lakh / sum(x["next_lakh"] for x in out)
    for x in out:
        x["next_lakh"] = round(x["next_lakh"] * scale, 2)
    return sorted(out, key=lambda x: -x["change_pct"])
