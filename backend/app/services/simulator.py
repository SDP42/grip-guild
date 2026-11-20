"""National rollout simulator.

Every assumption is returned with the result so judges can challenge it.
All figures are planning estimates, not Eurogrip data.
"""

DEFAULTS = {
    "shops_per_district": 1100,      # reachable 2W mechanics + puncture shops per district
    "enrol_rate": 0.55,              # share of reachable shops that join (field-led onboarding)
    "active_rate": 0.62,             # enrolled shops active in a given month
    "influenced_fitments_pm": 5.5,   # Eurogrip fitments/referrals per active shop per month
    "incrementality": 0.38,          # share that would NOT have happened without the Guild
    "tyre_asp_inr": 1450,            # average replacement tyre selling price
    "gross_margin": 0.30,
}

MIX_KEYS = ["tools", "visibility", "academy", "field", "digital"]
DEFAULT_MIX = {"tools": 0.40, "visibility": 0.22, "academy": 0.10, "field": 0.18, "digital": 0.10}


def simulate(budget_cr: float, districts: int, months: int = 12, mix: dict | None = None,
             assumptions: dict | None = None) -> dict:
    a = {**DEFAULTS, **(assumptions or {})}
    mix = {**DEFAULT_MIX, **(mix or {})}
    total = sum(mix[k] for k in MIX_KEYS) or 1
    mix = {k: mix[k] / total for k in MIX_KEYS}

    budget_inr = budget_cr * 1e7
    reachable = districts * a["shops_per_district"]

    # Field + digital spend drive enrolment; diminishing returns past ~₹1,800/shop.
    acquisition_per_shop = (budget_inr * (mix["field"] + mix["digital"])) / max(reachable, 1)
    enrol_mult = min(1.15, 0.45 + acquisition_per_shop / 1800 * 0.6)
    enrolled = int(reachable * a["enrol_rate"] * enrol_mult)

    # Tools + visibility + academy drive activity (the brief's insight: tools > cash).
    engagement_per_shop = (budget_inr * (mix["tools"] + mix["visibility"] + mix["academy"])) / max(enrolled, 1)
    active_mult = min(1.25, 0.55 + engagement_per_shop / 2600 * 0.55)
    active = int(enrolled * min(0.92, a["active_rate"] * active_mult))

    influenced = int(active * a["influenced_fitments_pm"] * months)
    incremental = int(influenced * a["incrementality"])
    revenue = incremental * a["tyre_asp_inr"]
    gross_profit = revenue * a["gross_margin"]

    ramp = []
    for m in range(1, months + 1):
        f = min(1.0, m / 4)  # 4-month ramp
        ramp.append({"month": m, "active": int(active * f),
                     "fitments": int(active * f * a["influenced_fitments_pm"])})

    return {
        "inputs": {"budget_cr": budget_cr, "districts": districts, "months": months, "mix": mix},
        "reachable_shops": reachable,
        "enrolled": enrolled,
        "active": active,
        "influenced_fitments": influenced,
        "incremental_tyres": incremental,
        "incremental_revenue_cr": round(revenue / 1e7, 2),
        "gross_profit_cr": round(gross_profit / 1e7, 2),
        "roi_x": round(gross_profit / budget_inr, 2) if budget_inr else 0,
        "cost_per_active_shop_inr": int(budget_inr / max(active, 1)),
        "cost_per_incremental_tyre_inr": int(budget_inr / max(incremental, 1)),
        "spend_breakdown_cr": {k: round(budget_cr * v, 2) for k, v in mix.items()},
        "ramp": ramp,
        "assumptions": a,
    }
