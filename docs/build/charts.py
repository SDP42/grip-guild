"""Generate every chart and diagram used in the Grip Guild report.

Simulator figures come from the same FastAPI model the prototype uses, and lift
figures from the seeded pilot database, so the document and the product agree.
"""
import sqlite3
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle, Wedge  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT / "backend"))
from app.services.simulator import simulate  # noqa: E402

MOLTEN, INK, AMBER, GREEN, SKY, VIOLET, ROSE, GREY = "#FF5A1F", "#111318", "#F59E0B", "#65A30D", "#0EA5E9", "#8B5CF6", "#E11D48", "#6B7280"
LIGHT = "#F3F4F6"
plt.rcParams.update({
    "font.family": ["Inter", "Arial", "DejaVu Sans"], "font.size": 10, "axes.edgecolor": "#D1D5DB",
    "axes.spines.top": False, "axes.spines.right": False, "axes.titleweight": "bold", "axes.titlesize": 12,
    "axes.labelcolor": "#374151", "xtick.color": "#4B5563", "ytick.color": "#4B5563", "figure.dpi": 200,
})


def save(fig, name):
    fig.savefig(OUT / f"{name}.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote", name)


def box(ax, x, y, w, h, text, fc="#FFFFFF", ec=INK, tc=INK, fs=9, bold=False, r=0.02):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.005,rounding_size={r}", fc=fc, ec=ec, lw=1.2))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs, color=tc, weight="bold" if bold else "normal", wrap=True)


def arrow(ax, a, b, c=GREY, style="-|>", lw=1.3, rad=0.0):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=12, color=c, lw=lw, connectionstyle=f"arc3,rad={rad}"))


def canvas(w=10, h=5.6):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(-0.012, 1.012); ax.set_ylim(-0.01, 1.01); ax.axis("off")
    return fig, ax


# 1. Architecture ----------------------------------------------------------
def architecture():
    fig, ax = canvas(11, 6.6)
    ax.text(0.5, 0.975, "Grip Guild — system architecture", ha="center", fontsize=14, weight="bold")
    layers = [
        (0.83, "CHANNELS", [("WhatsApp Guild Bot\n(Meta Cloud API)", "#DCFCE7"), ("Mechanic web app\n(PWA, phone-first)", "#FFEDD5"),
                            ("Rider pages\nSOS · Twin · Board", "#E0F2FE"), ("Dealer & field\nconsoles", "#EDE9FE"), ("Brand Command\nCentre", "#F3F4F6")]),
        (0.62, "FRONTEND · Next.js 15 + React 19", [("Landing & 3D\nThree.js · GSAP · Lenis", "#FFF7ED"), ("Persona apps\nApp Router", "#FFF7ED"),
                                                     ("Charts\nRecharts", "#FFF7ED"), ("Live polling\n4 s inbox sync", "#FFF7ED")]),
        (0.41, "API · FastAPI (Python)", [("Mechanics &\nPersonas", "#FEF3C7"), ("Advocacy\nscan · refer · shelf", "#FEF3C7"), ("Live flows\nSOS · inbox · cards", "#FEF3C7"),
                                          ("Ecosystem\ndealer · field · fleet", "#FEF3C7"), ("Analytics\nlift · fraud · autopilot", "#FEF3C7")]),
        (0.20, "INTELLIGENCE SERVICES", [("Guild Score", "#ECFCCB"), ("Fraud Guard", "#ECFCCB"), ("Nudge Engine", "#ECFCCB"), ("Guild Coach", "#ECFCCB"),
                                         ("TreadLens", "#ECFCCB"), ("Simulator", "#ECFCCB"), ("Autopilot", "#ECFCCB")]),
        (0.02, "DATA", [("SQLite (prototype) → PostgreSQL (scale)\nMechanics · Fitments · Referrals · Tyre Twins · Notifications · Orders · Credit", "#F3F4F6")]),
    ]
    for y, title, items in layers:
        ax.text(0.0, y + 0.135, title, fontsize=8.5, weight="bold", color=MOLTEN)
        n = len(items)
        gap = 0.012
        w = (1 - gap * (n - 1)) / n
        for i, (t, fc) in enumerate(items):
            box(ax, i * (w + gap), y, w, 0.12, t, fc=fc, ec="#9CA3AF", fs=8.3)
    for y in (0.62, 0.41, 0.20, 0.02 + 0.0):
        arrow(ax, (0.5, y + 0.205 if y != 0.02 else 0.20), (0.5, y + 0.125), c=MOLTEN, lw=1.8)
    save(fig, "architecture")


# 2. Ecosystem flywheel ------------------------------------------------------
def flywheel():
    fig, ax = plt.subplots(figsize=(7.2, 7.2))
    ax.set_xlim(-1.35, 1.35); ax.set_ylim(-1.35, 1.35); ax.axis("off"); ax.set_aspect("equal")
    steps = [("Mechanic recommends\nEurogrip", MOLTEN), ("Verified fitment\nor referral", AMBER), ("Points pay off\na real tool", GREEN),
             ("Better shop, higher\ntier & board", SKY), ("Riders find & trust\nthe shop (SOS, ratings)", VIOLET), ("More customers come\nback (Boomerang)", ROSE)]
    n = len(steps)
    for i, (t, c) in enumerate(steps):
        a = np.pi / 2 - i * 2 * np.pi / n
        x, y = np.cos(a) * 0.95, np.sin(a) * 0.95
        ax.add_patch(Circle((x, y), 0.3, fc=c, ec="white", lw=3, alpha=0.95))
        ax.text(x, y, t, ha="center", va="center", color="white", fontsize=8.6, weight="bold")
        a2 = np.pi / 2 - (i + 1) * 2 * np.pi / n
        p1 = (np.cos(a - 0.36) * 0.95, np.sin(a - 0.36) * 0.95)
        p2 = (np.cos(a2 + 0.36) * 0.95, np.sin(a2 + 0.36) * 0.95)
        arrow(ax, p1, p2, c="#9CA3AF", lw=2, rad=-0.25)
    ax.add_patch(Circle((0, 0), 0.42, fc=INK))
    ax.text(0, 0.06, "GRIP", ha="center", color="white", fontsize=17, weight="bold")
    ax.text(0, -0.12, "GUILD", ha="center", color=MOLTEN, fontsize=17, weight="bold")
    ax.set_title("The Guild flywheel: advocacy that compounds instead of fading", pad=8)
    save(fig, "flywheel")


# 3. Insight → feature map ---------------------------------------------------
def insight_map():
    fig, ax = canvas(11, 6)
    ins = ["Lukewarm awareness", "Stocking lags competitors", "Tools > cash as #1 ask", "Visibility & status rising", "Non-stockers already advocate"]
    feats = [("Guild Coach · Guild Score", 0), ("Ghost Shelf", 1), ("Fitments Pay Off Your Tools · Tool Pools", 2),
             ("Guild ladder · Living Shop Board · Academy", 3), ("Referral codes · Influence Graph", 4), ("Puncture SOS · Boomerang · Fleet Pit Pass", 0),
             ("Lift Engine · Fraud Guard · Nudge Engine", 4)]
    ax.text(0.17, 0.97, "BRIEF INSIGHT (Eurogrip brand-track)", ha="center", weight="bold", color=MOLTEN, fontsize=9)
    ax.text(0.8, 0.97, "GRIP GUILD RESPONSE", ha="center", weight="bold", color=GREEN, fontsize=9)
    iy = np.linspace(0.85, 0.1, len(ins))
    fy = np.linspace(0.88, 0.06, len(feats))
    for y, t in zip(iy, ins):
        box(ax, 0.0, y - 0.05, 0.34, 0.1, t, fc="#FFF7ED", ec=MOLTEN, fs=9.5, bold=True)
    for (t, k), y in zip(feats, fy):
        box(ax, 0.6, y - 0.045, 0.4, 0.09, t, fc="#F7FEE7", ec=GREEN, fs=9)
        arrow(ax, (0.34, iy[k]), (0.6, y), c="#9CA3AF", lw=1.2, rad=0.05)
    save(fig, "insight_map")


# 4. Budget donut ------------------------------------------------------------
def budget():
    mix = {"Tools & equipment": 40, "Visibility & boards": 22, "Field force & Circles": 18, "Academy": 10, "Bot, data & tech": 10}
    colors = [MOLTEN, AMBER, SKY, GREEN, VIOLET]
    fig, ax = plt.subplots(figsize=(8, 4.6))
    w, _ = ax.pie(mix.values(), colors=colors, startangle=90, counterclock=False, wedgeprops=dict(width=0.38, edgecolor="white", linewidth=2))
    ax.text(0, 0.08, "₹25 Cr", ha="center", fontsize=20, weight="bold")
    ax.text(0, -0.15, "annual plan", ha="center", fontsize=9, color=GREY)
    ax.legend(w, [f"{k} — {v}% (₹{25 * v / 100:.1f} Cr)" for k, v in mix.items()], loc="center left", bbox_to_anchor=(1.0, 0.5), frameon=False, fontsize=9.5)
    ax.set_title("Budget allocation: 72% goes to things mechanics keep")
    save(fig, "budget")


# 5. Scenario chart from the real simulator ---------------------------------
def scenarios():
    budgets = [10, 15, 20, 25, 30, 40]
    guild = [simulate(b, 120) for b in budgets]
    cash = [simulate(b, 120, mix={"tools": 5, "visibility": 5, "academy": 0, "field": 15, "digital": 75}) for b in budgets]
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.2))
    x = np.arange(len(budgets))
    axes[0].bar(x - 0.2, [g["incremental_tyres"] / 1e5 for g in guild], 0.4, color=MOLTEN, label="Grip Guild mix")
    axes[0].bar(x + 0.2, [c["incremental_tyres"] / 1e5 for c in cash], 0.4, color="#D1D5DB", label="Cash-scheme style mix")
    axes[0].set_xticks(x, [f"₹{b} Cr" for b in budgets]); axes[0].set_ylabel("Incremental tyres (lakh / yr)")
    axes[0].set_title("Same budget, more tyres"); axes[0].legend(frameon=False)
    axes[1].plot(budgets, [g["cost_per_incremental_tyre_inr"] for g in guild], marker="o", color=MOLTEN, lw=2.4, label="Grip Guild mix")
    axes[1].plot(budgets, [c["cost_per_incremental_tyre_inr"] for c in cash], marker="o", color=GREY, lw=2, ls="--", label="Cash-scheme style mix")
    axes[1].set_xlabel("Annual budget (₹ Cr)"); axes[1].set_ylabel("Cost per incremental tyre (₹)")
    axes[1].set_title("Cost efficiency"); axes[1].legend(frameon=False)
    fig.suptitle("Output of the Grip Guild rollout simulator (120 districts, planning assumptions)", fontsize=10, color=GREY, y=1.02)
    save(fig, "scenarios")
    return guild[3]


def ramp(sim):
    fig, ax = plt.subplots(figsize=(10, 3.4))
    m = [r["month"] for r in sim["ramp"]]
    ax.fill_between(m, [r["active"] for r in sim["ramp"]], color=MOLTEN, alpha=0.18)
    ax.plot(m, [r["active"] for r in sim["ramp"]], color=MOLTEN, lw=2.4)
    ax.set_xlabel("Month"); ax.set_ylabel("Active shops")
    ax.set_title(f"12-month ramp at ₹25 Cr: {sim['active']:,} active shops, {sim['incremental_tyres']:,} incremental tyres")
    save(fig, "ramp")


# 6. Lift from the pilot database --------------------------------------------
def lift():
    db = ROOT / "backend" / "gripguild.db"
    con = sqlite3.connect(db)
    rows = con.execute("select name, cohort, baseline_share, current_share from district").fetchall()
    con.close()
    pilot = sorted([(n, c - b) for n, k, b, c in rows if k == "pilot"], key=lambda x: -x[1])
    control = sorted([(n, c - b) for n, k, b, c in rows if k == "control"], key=lambda x: -x[1])
    fig, ax = plt.subplots(figsize=(11, 4))
    ax.bar([p[0] for p in pilot], [p[1] for p in pilot], color=GREEN, label="Pilot districts")
    ax.bar([c[0] for c in control], [c[1] for c in control], color="#D1D5DB", label="Matched control districts")
    ax.axhline(0, color="#9CA3AF", lw=0.8)
    dp = np.mean([p[1] for p in pilot]); dc = np.mean([c[1] for c in control])
    ax.set_ylabel("Change in replacement share (pp)")
    ax.set_title(f"Lift Engine (simulated pilot): pilot +{dp:.2f} pp vs control +{dc:.2f} pp → incremental +{dp - dc:.2f} pp")
    ax.tick_params(axis="x", rotation=60, labelsize=8); ax.legend(frameon=False)
    save(fig, "lift")
    return dp, dc


# 7. Rollout Gantt -------------------------------------------------------------
def gantt():
    phases = [("Phase 0 · Design & partner sign-up", 0, 2, GREY), ("Phase 1 · Pilot: 10 pilot + 10 control districts", 2, 4, MOLTEN),
              ("Read lift, tune incentives", 6, 1, AMBER), ("Phase 2 · Scale to 120 districts", 7, 5, SKY),
              ("Guild Circles & Tool Pools", 8, 10, GREEN), ("Fleet Pit Pass partnerships", 9, 9, VIOLET),
              ("Phase 3 · National (600+ districts)", 12, 12, ROSE), ("Guild Passport credit partner", 14, 10, GREEN)]
    fig, ax = plt.subplots(figsize=(11, 4.2))
    for i, (t, s, d, c) in enumerate(phases):
        ax.barh(i, d, left=s, color=c, height=0.6)
        ax.text(s + 0.15, i, t, va="center", fontsize=8.6, color="white" if c != GREY else "white", weight="bold")
    ax.set_yticks([]); ax.invert_yaxis(); ax.set_xlim(0, 24)
    ax.set_xticks(range(0, 25, 3), [f"M{m}" for m in range(0, 25, 3)])
    ax.set_title("24-month rollout plan")
    ax.grid(axis="x", color="#E5E7EB")
    save(fig, "gantt")


# 8. Before / after radar ----------------------------------------------------
def radar():
    labels = ["Mechanic\nrecommendation", "Stocking /\navailability", "Measurability", "Sustained\nengagement", "Rider\ntrust", "Cost\nefficiency", "Data on\nend riders"]
    before = [3, 3, 2, 2, 4, 3, 1]
    after = [8, 8, 9, 8, 8, 7, 8]
    ang = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
    ang += ang[:1]
    fig, ax = plt.subplots(figsize=(6.6, 6.6), subplot_kw=dict(polar=True))
    for v, c, l in ((before, GREY, "Today (cash / no programme)"), (after, MOLTEN, "With Grip Guild (target)")):
        vv = v + v[:1]
        ax.plot(ang, vv, color=c, lw=2, label=l); ax.fill(ang, vv, color=c, alpha=0.18)
    ax.set_xticks(ang[:-1], labels, fontsize=8.6); ax.set_yticks([2, 4, 6, 8, 10], ["", "", "", "", ""]); ax.set_ylim(0, 10)
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.06), frameon=False, ncol=2, fontsize=8.6)
    ax.set_title("Before vs after (team assessment, 0–10)", pad=18)
    save(fig, "radar")


# 9. Competitive 2x2 -------------------------------------------------------------
def positioning():
    fig, ax = plt.subplots(figsize=(7.5, 6))
    ax.axhline(0.5, color="#D1D5DB"); ax.axvline(0.5, color="#D1D5DB")
    ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.set_xticks([]); ax.set_yticks([])
    ax.set_xlabel("Reward type: cash / discounts  →  tools, customers, status", fontsize=9.5)
    ax.set_ylabel("Measurement: none / sales only  →  influence + incrementality", fontsize=9.5)
    pts = [("Trade schemes\n(price-offs)", 0.15, 0.15, GREY), ("QR-cash loyalty apps\n(lubes, paints)", 0.22, 0.42, GREY),
           ("Skill contests\n(one-off)", 0.6, 0.2, GREY), ("Merchandise drops", 0.68, 0.32, GREY), ("GRIP GUILD", 0.82, 0.85, MOLTEN)]
    for t, x, y, c in pts:
        ax.scatter(x, y, s=900 if c == MOLTEN else 380, color=c, alpha=0.9, edgecolor="white", lw=2)
        ax.text(x, y - 0.085 if c != MOLTEN else y - 0.1, t, ha="center", fontsize=8.8 if c != MOLTEN else 11, weight="bold" if c == MOLTEN else "normal")
    ax.text(0.75, 0.97, "Compounding, measurable", ha="center", fontsize=8.5, color=GREEN, weight="bold")
    ax.text(0.25, 0.03, "Rented loyalty", ha="center", fontsize=8.5, color=ROSE, weight="bold")
    ax.set_title("Where Grip Guild sits versus typical trade-influencer programmes")
    save(fig, "positioning")


# 10. Funnel ------------------------------------------------------------------
def funnel(sim):
    stages = [("Reachable shops", sim["reachable_shops"]), ("Enrolled", sim["enrolled"]), ("Active monthly", sim["active"]),
              ("Influenced fitments / mo (÷10)", int(sim["influenced_fitments"] / 12 / 10)), ("Incremental tyres / mo (÷10)", int(sim["incremental_tyres"] / 12 / 10))]
    fig, ax = plt.subplots(figsize=(10, 3.8))
    mx = stages[0][1]
    for i, (t, v) in enumerate(stages):
        w = v / mx
        ax.barh(i, w, left=(1 - w) / 2, color=[GREY, SKY, MOLTEN, AMBER, GREEN][i], height=0.75)
        inside = w > 0.35
        ax.text(0.5 if inside else 0.5 + w / 2 + 0.01, i, f"{t}: {v:,}", ha="center" if inside else "left", va="center",
                color="white" if inside else INK, fontsize=9.5, weight="bold")
    ax.invert_yaxis(); ax.axis("off")
    ax.set_title("Advocacy funnel at ₹25 Cr across 120 districts (simulator output)")
    save(fig, "funnel")


# 11. Guild Score composition -------------------------------------------------
def score():
    parts = {"Verified fitments": 30, "Advocacy (redeemed referrals)": 30, "Rider rating": 15, "Academy skills": 15, "Consistency (streak)": 10}
    fig, ax = plt.subplots(figsize=(10, 2.2))
    left = 0
    for (k, v), c in zip(parts.items(), [MOLTEN, GREEN, AMBER, VIOLET, SKY]):
        ax.barh(0, v, left=left, color=c, height=0.6)
        ax.text(left + v / 2, 0, f"{k}\n{v}%", ha="center", va="center", color="white", fontsize=8.6, weight="bold")
        left += v
    ax.set_xlim(0, 100); ax.axis("off")
    ax.set_title("Guild Score (0–1000) weights — open fraud alerts apply up to a 40% penalty")
    save(fig, "guild_score")


# 12. SOS sequence diagram --------------------------------------------------------
def sos_sequence():
    fig, ax = canvas(11, 5.6)
    actors = [("Rider (Priya)", 0.1, SKY), ("Grip Guild API", 0.37, INK), ("Mechanic app (Ravi)", 0.63, MOLTEN), ("Command Centre", 0.9, VIOLET)]
    for t, x, c in actors:
        box(ax, x - 0.09, 0.88, 0.18, 0.08, t, fc=c, ec=c, tc="white", bold=True, fs=9)
        ax.plot([x, x], [0.05, 0.88], color="#D1D5DB", ls="--", lw=1)
    msgs = [(0.1, 0.37, "POST /sos — nearest 3 Guild shops"), (0.37, 0.1, "Radar map + ETAs"), (0.1, 0.37, "POST /sos/request (shop chosen)"),
            (0.37, 0.63, "Notification + live SOS banner"), (0.63, 0.37, "POST /sos/{id}/accept"), (0.37, 0.1, "Poll → 'Ravi is on the way, 4 min'"),
            (0.63, 0.37, "POST /sos/{id}/fixed → +40 pts"), (0.1, 0.37, "POST /rider/rate"), (0.37, 0.9, "Rescues, ratings feed Guild Score")]
    ys = np.linspace(0.8, 0.1, len(msgs))
    for (a, b, t), y in zip(msgs, ys):
        arrow(ax, (a, y), (b, y), c=MOLTEN if b > a else GREEN, lw=1.5)
        ax.text((a + b) / 2, y + 0.018, t, ha="center", fontsize=8.4)
    ax.text(0.5, 0.99, "Puncture SOS: one tap moves state across three personas", ha="center", weight="bold", fontsize=12)
    save(fig, "sos_sequence")


# 13. Ghost Shelf flow ------------------------------------------------------------
def ghost_flow():
    fig, ax = canvas(11, 3.4)
    steps = [("Rider needs a tyre\nat a non-stocking shop", "#E0F2FE"), ("Mechanic orders on\nGhost Shelf (app/bot)", "#FFEDD5"),
             ("Nearest dealer gets\nthe order in its queue", "#EDE9FE"), ("Dispatched → delivered\nin 2–6 h (SLA)", "#FEF3C7"),
             ("Mechanic fits & scans\nQR → +60 pts", "#ECFCCB"), ("Eurogrip sale with\nzero shop inventory", "#FFE4E6")]
    w = 0.145
    for i, (t, c) in enumerate(steps):
        x = i * (w + 0.026)
        box(ax, x, 0.25, w, 0.5, t, fc=c, ec="#9CA3AF", fs=8.8)
        if i < len(steps) - 1:
            arrow(ax, (x + w, 0.5), (x + w + 0.026, 0.5), c=MOLTEN, lw=1.8)
    ax.text(0.5, 0.92, "Ghost Shelf: influence without inventory becomes a sale", ha="center", weight="bold", fontsize=12)
    save(fig, "ghost_flow")


# 14. Tier ladder ------------------------------------------------------------------
def tiers():
    fig, ax = canvas(11, 3.6)
    t = [("Apprentice", "0 pts", "Sticker + verify-QR\nStarter kit · Academy", "#9CA3AF"), ("Craftsman", "1,500 pts", "Metal Guild plate\nTool leases · Uniform", SKY),
         ("Master", "5,000 pts", "LED Living Shop Board\nPower tools · Credit", AMBER), ("Grandmaster", "12,000 pts", "Shop-front makeover\nPneumatic changer · Mentor", MOLTEN)]
    for i, (n, p, perks, c) in enumerate(t):
        x = 0.02 + i * 0.245
        h = 0.32 + i * 0.16
        ax.add_patch(FancyBboxPatch((x, 0.05), 0.22, h, boxstyle="round,pad=0.005,rounding_size=0.02", fc=c, ec="white"))
        ax.text(x + 0.11, 0.05 + h - 0.07, n, ha="center", color="white", weight="bold", fontsize=12)
        ax.text(x + 0.11, 0.05 + h - 0.14, p, ha="center", color="white", fontsize=9)
        ax.text(x + 0.11, 0.05 + 0.1, perks, ha="center", color="white", fontsize=8.2)
    ax.text(0.5, 0.97, "The Guild ladder: status you can see from the road", ha="center", weight="bold", fontsize=12)
    save(fig, "tiers")


# 15. Risk matrix -------------------------------------------------------------------
def risks():
    items = [("Fake scans / collusion", 0.7, 0.75), ("Low smartphone literacy", 0.55, 0.45), ("Dealer resistance to Ghost Shelf", 0.45, 0.6),
             ("Tool misuse / resale", 0.3, 0.4), ("Budget overrun", 0.25, 0.7), ("Competitor copies", 0.6, 0.3), ("Data privacy", 0.2, 0.8)]
    fig, ax = plt.subplots(figsize=(7.5, 5.6))
    xx, yy = np.meshgrid(np.linspace(0, 1, 50), np.linspace(0, 1, 50))
    ax.imshow(xx * yy, extent=(0, 1, 0, 1), origin="lower", cmap="YlOrRd", alpha=0.55)
    for t, p, i in items:
        ax.scatter(p, i, s=160, color=INK)
        ax.text(p + 0.02, i + 0.02, t, fontsize=8.6)
    ax.set_xlabel("Likelihood"); ax.set_ylabel("Impact"); ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.set_title("Risk heat map (before mitigation)")
    save(fig, "risks")


# 16. KPI tree ---------------------------------------------------------------------
def kpi_tree():
    fig, ax = canvas(11, 5)
    box(ax, 0.36, 0.82, 0.28, 0.12, "North star: incremental Eurogrip\nreplacement share (pp, vs control)", fc=MOLTEN, ec=MOLTEN, tc="white", bold=True, fs=9.5)
    mids = [("Reach", "Enrolled shops\nActive 30-day shops"), ("Advocacy", "Referral issue & redeem\nNon-stock advocates"),
            ("Conversion", "Verified fitments\nGhost Shelf orders"), ("Retention", "Streaks · Quest claims\nTool EMI progress"), ("Trust", "Rider ratings · SOS rescues\nFraud rate")]
    for i, (h, b) in enumerate(mids):
        x = 0.01 + i * 0.2
        box(ax, x, 0.48, 0.18, 0.14, f"{h}\n{b}", fc="#FFF7ED", ec=MOLTEN, fs=8.6)
        arrow(ax, (0.5, 0.82), (x + 0.09, 0.62), c="#9CA3AF")
    lows = ["Guild Score (per shop)", "Lift Engine (per district)", "Influence Graph (who sells)", "Nudge Engine (who drifts)", "Autopilot (where money goes)"]
    for i, t in enumerate(lows):
        x = 0.01 + i * 0.2
        box(ax, x, 0.12, 0.18, 0.12, t, fc="#ECFCCB", ec=GREEN, fs=8.6)
        arrow(ax, (x + 0.09, 0.48), (x + 0.09, 0.24), c="#9CA3AF")
    ax.text(0.5, 0.02, "Every KPI is computed live by the prototype's FastAPI backend", ha="center", fontsize=8.5, color=GREY)
    save(fig, "kpi_tree")


# 17. Stakeholder value table as heat map -------------------------------------------
def stakeholder():
    rows = ["Mechanic", "Rider", "Dealer", "Field officer", "Eurogrip brand"]
    cols = ["Income", "Tools/assets", "Customers", "Status/trust", "Data/insight"]
    m = np.array([[4, 5, 5, 5, 2], [2, 1, 4, 5, 3], [5, 1, 4, 2, 4], [1, 1, 2, 2, 5], [5, 2, 4, 4, 5]])
    fig, ax = plt.subplots(figsize=(8, 3.8))
    ax.imshow(m, cmap="Oranges", vmin=0, vmax=5)
    ax.set_xticks(range(len(cols)), cols); ax.set_yticks(range(len(rows)), rows)
    for i in range(len(rows)):
        for j in range(len(cols)):
            ax.text(j, i, "●" * m[i, j], ha="center", va="center", fontsize=7, color=INK if m[i, j] < 4 else "white")
    ax.set_title("Who gains what (team assessment, 1–5)")
    for s in ax.spines.values():
        s.set_visible(False)
    save(fig, "stakeholders")


# 18. Data model ----------------------------------------------------------------------
def data_model():
    fig, ax = canvas(11, 5.8)
    ents = {"District": (0.02, 0.72), "Dealer": (0.02, 0.42), "Mechanic": (0.36, 0.6), "Circle": (0.02, 0.12),
            "Fitment": (0.7, 0.8), "Referral": (0.7, 0.58), "TreadCheck\n(Tyre Twin)": (0.7, 0.36), "ToolLease": (0.36, 0.25),
            "Notification": (0.7, 0.12), "SOSRequest": (0.36, 0.02), "GhostOrder": (0.18, 0.88)}
    for k, (x, y) in ents.items():
        box(ax, x, y, 0.26 if k != "Mechanic" else 0.28, 0.11 if k != "Mechanic" else 0.2, k, fc="#FFF7ED" if k == "Mechanic" else "#F9FAFB",
            ec=MOLTEN if k == "Mechanic" else "#9CA3AF", fs=10 if k == "Mechanic" else 9, bold=k == "Mechanic")
    cx, cy = 0.5, 0.7
    for k, (x, y) in ents.items():
        if k == "Mechanic":
            continue
        arrow(ax, (cx, cy), (x + 0.13, y + 0.055), c="#9CA3AF", style="-", lw=1)
    ax.text(0.5, 0.995, "Core data model (SQLModel) — Mechanic at the centre", ha="center", weight="bold", fontsize=12)
    save(fig, "data_model")


# 19. Unit economics waterfall ---------------------------------------------------------
def waterfall(sim):
    per_shop = sim["cost_per_active_shop_inr"]
    tyres = sim["incremental_tyres"] / sim["active"]
    rev = tyres * sim["assumptions"]["tyre_asp_inr"]
    gp = rev * sim["assumptions"]["gross_margin"]
    steps = [("Incremental revenue\nper active shop", rev, GREEN), ("Cost of goods (70%)", -(rev - gp), "#D1D5DB"), ("Programme cost\nper active shop", -per_shop, ROSE)]
    fig, ax = plt.subplots(figsize=(9, 3.8))
    cur = 0
    for i, (t, v, c) in enumerate(steps):
        ax.bar(i, v, bottom=cur if v < 0 else 0, color=c)
        ax.text(i, (cur + v / 2) if v < 0 else v / 2, f"₹{abs(v):,.0f}", ha="center", va="center", weight="bold", fontsize=9)
        cur += v
    ax.bar(3, cur, color=MOLTEN)
    ax.text(3, cur / 2, f"₹{cur:,.0f}", ha="center", va="center", weight="bold", color="white")
    ax.set_xticks(range(4), [s[0] for s in steps] + ["Net contribution\nper active shop / yr"], fontsize=8.6)
    ax.set_title("Unit economics per active Guild shop (simulator, ₹25 Cr scenario)")
    ax.axhline(0, color="#9CA3AF", lw=0.8)
    save(fig, "waterfall")


if __name__ == "__main__":
    architecture(); flywheel(); insight_map(); budget()
    s25 = scenarios(); ramp(s25); lift(); gantt(); radar(); positioning(); funnel(s25); score()
    sos_sequence(); ghost_flow(); tiers(); risks(); kpi_tree(); stakeholder(); data_model(); waterfall(s25)
    import json
    (OUT / "sim25.json").write_text(json.dumps(s25, indent=1))
