"""TreadLens — turns a 20-second tyre check into a rider-facing health card.

In production the tread depth and wear pattern come from a phone photo
(on-device CV). Here the mechanic's measurements drive the same scoring.
"""

PATTERNS = {
    "even": ("Even wear", "Healthy wear pattern.", 0),
    "center": ("Centre wear", "Over-inflation — reduce pressure to spec.", 10),
    "edges": ("Edge wear", "Under-inflation — tyre runs hot and wears fast.", 15),
    "cupping": ("Cupping", "Suspension or balance issue — get a wheel balance.", 20),
    "one_side": ("One-sided wear", "Alignment / bent rim — inspect the wheel.", 18),
}

LEGAL_MIN_MM = 1.6  # common international minimum for tread depth


def analyse(tread_mm: float, pattern: str, psi: float, recommended_psi: float, age_months: int,
            cracks: bool = False) -> dict:
    label, advice, pattern_penalty = PATTERNS.get(pattern, PATTERNS["even"])
    depth_score = max(0.0, min(1.0, (tread_mm - LEGAL_MIN_MM) / (5.0 - LEGAL_MIN_MM))) * 60
    psi_dev = abs(psi - recommended_psi) / max(recommended_psi, 1)
    psi_score = max(0.0, 20 - psi_dev * 80)
    age_score = max(0.0, 20 - max(0, age_months - 24) * 0.6)
    score = round(max(0, depth_score + psi_score + age_score - pattern_penalty - (15 if cracks else 0)))

    if tread_mm <= LEGAL_MIN_MM or score < 35:
        verdict, color = "Replace now", "red"
    elif score < 65:
        verdict, color = "Replace within 2 months", "amber"
    else:
        verdict, color = "Safe to ride", "green"

    km_left = max(0, int((tread_mm - LEGAL_MIN_MM) * 4200))
    wet_grip = max(10, min(100, int(tread_mm / 5.0 * 100)))
    findings = [advice]
    if psi_dev > 0.1:
        findings.append(f"Pressure {psi:.0f} psi vs {recommended_psi:.0f} psi spec.")
    if cracks:
        findings.append("Sidewall cracks detected — rubber ageing.")
    if age_months > 48:
        findings.append("Tyre older than 4 years — check for hardening.")
    return {
        "score": score, "verdict": verdict, "color": color, "pattern": label,
        "km_left_estimate": km_left, "wet_grip_pct": wet_grip, "findings": findings,
        "recommendation": "Eurogrip Protorq Extreme" if verdict != "Safe to ride" else None,
    }
