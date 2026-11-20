"""Guild Bot — WhatsApp-first, vernacular, zero-install.

A rules-based intent engine (keyword + Hinglish synonyms + menu numbers).
Production would sit behind the WhatsApp Business Cloud API; the same
`reply()` function powers the in-browser simulator.
"""
import random
import re
from datetime import datetime, timedelta

from sqlmodel import Session, func, select

from ..models import Dealer, Fitment, Mechanic, Referral, Tool, ToolLease
from .fraud import check_scan
from .tiers import next_tier, tier_for
from .treadlens import analyse

INTENTS = {
    "menu": ["hi", "hello", "namaste", "menu", "start", "help", "namaskar", "vanakkam", "0"],
    "scan": ["scan", "fit", "fitment", "lagaya", "1"],
    "points": ["points", "point", "balance", "kitne", "wallet", "2"],
    "refer": ["refer", "referral", "code", "bhejo", "customer", "3"],
    "tools": ["tool", "tools", "emi", "lease", "machine", "4"],
    "rank": ["rank", "leaderboard", "circle", "position", "5"],
    "tread": ["tread", "treadlens", "check", "health", "6"],
}

MENU = [
    "1️⃣ Scan a fitment", "2️⃣ My points & tier", "3️⃣ Refer a rider",
    "4️⃣ My tool EMI", "5️⃣ Circle rank", "6️⃣ TreadLens check",
]

SERIAL_RE = re.compile(r"\bEG[0-9A-F]{6,12}\b", re.I)
TREAD_RE = re.compile(r"(\d+(?:\.\d+)?)\s*mm", re.I)


def detect(text: str) -> str:
    t = text.lower().strip()
    if SERIAL_RE.search(text):
        return "scan"
    if TREAD_RE.search(text):
        return "tread"
    words = re.findall(r"[a-z0-9]+", t)
    for intent, keys in INTENTS.items():
        if any(w in keys for w in words):
            return intent
    return "unknown"


def _msg(text: str, card: dict | None = None, quick: list[str] | None = None) -> dict:
    return {"text": text, "card": card, "quick_replies": quick or []}


def reply(session: Session, mechanic: Mechanic, text: str, now: datetime | None = None) -> list[dict]:
    now = now or datetime.now()
    intent = detect(text)
    first = mechanic.name.split()[0]

    if intent == "menu":
        return [_msg(f"Namaste {first} ji 🙏 Welcome to *Grip Guild*.\nReply with a number:\n" + "\n".join(MENU),
                     quick=["1", "2", "3", "4", "5", "6"])]

    if intent == "scan":
        m = SERIAL_RE.search(text)
        if not m:
            return [_msg("📷 Send the tyre serial printed under the QR, e.g. *EG7F3A91C2D0*.",
                         quick=["EG7F3A91C2D0"])]
        serial = m.group(0).upper()
        exists = session.exec(select(Fitment).where(Fitment.serial == serial)).first() is not None
        recent = session.exec(select(Fitment.created_at).where(
            Fitment.mechanic_id == mechanic.id, Fitment.created_at > now - timedelta(minutes=10))).all()
        flags = check_scan(serial_exists=exists, recent_scan_times=list(recent), now=now,
                           shop_lat=mechanic.lat, shop_lng=mechanic.lng, scan_lat=None, scan_lng=None)
        if flags:
            return [_msg(f"⚠️ {flags[0]['detail']} No points credited. Our team will check.")]
        channel = "stock" if mechanic.stocks_eurogrip else "ghost_shelf"
        pts = 50 if channel == "stock" else 60
        fit = Fitment(mechanic_id=mechanic.id, serial=serial, tyre_model="Protorq Extreme",
                      vehicle="Splendor+", rider_phone_masked="+91 9XXXX XX17", points=pts,
                      channel=channel, created_at=now, reminder_due_at=now + timedelta(days=420))
        before = mechanic.tier
        mechanic.points += pts
        mechanic.lifetime_points += pts
        mechanic.tier = tier_for(mechanic.lifetime_points)
        lease = session.exec(select(ToolLease).where(ToolLease.mechanic_id == mechanic.id,
                                                     ToolLease.status == "active")).first()
        emi_line = ""
        if lease:
            share = pts // 2
            lease.points_paid = min(lease.points_total, lease.points_paid + share)
            if lease.points_paid >= lease.points_total:
                lease.status = "owned"
            session.add(lease)
            emi_line = f"\n🔧 {share} pts went to your tool EMI ({round(100 * lease.points_paid / lease.points_total)}% owned)."
        session.add_all([fit, mechanic])
        session.commit()
        out = [_msg(f"✅ Fitment verified! *+{pts} pts*\nTyre {serial} registered. "
                    f"The rider will get a Customer Boomerang reminder in ~14 months — they'll come back to *you*."
                    + emi_line,
                    card={"type": "fitment", "serial": serial, "points": pts, "channel": channel},
                    quick=["2", "3"])]
        if mechanic.tier != before:
            out.append(_msg(f"🏆 Level up! You are now a *{mechanic.tier}*. A new shop board is on its way.",
                            card={"type": "tier_up", "tier": mechanic.tier}))
        return out

    if intent == "points":
        nt = next_tier(mechanic.lifetime_points)
        progress = (f"{nt['min'] - mechanic.lifetime_points} pts to *{nt['name']}*" if nt
                    else "You are at the top — Grandmaster 👑")
        return [_msg(f"💰 Balance: *{mechanic.points:,} pts*\n🎖 Tier: *{mechanic.tier}*\n📈 {progress}\n"
                     f"🔥 Streak: {mechanic.streak_weeks} weeks",
                     card={"type": "wallet", "points": mechanic.points, "tier": mechanic.tier,
                           "lifetime": mechanic.lifetime_points}, quick=["4", "5"])]

    if intent == "refer":
        dealer = session.exec(select(Dealer).where(Dealer.district_id == mechanic.district_id)).first()
        code = "GG-" + "".join(random.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5))
        session.add(Referral(code=code, mechanic_id=mechanic.id, dealer_id=dealer.id,
                             tyre_model="Protorq Extreme", status="issued", created_at=now))
        session.commit()
        return [_msg(f"🎟 Referral code *{code}* created.\nForward this to your rider 👇\n\n"
                     f"_\"{mechanic.shop_name} recommends Eurogrip. Show code {code} at {dealer.name} "
                     f"for a free fitting check.\"_\n\nYou earn *80 pts* when they buy — even if you don't stock Eurogrip.",
                     card={"type": "referral", "code": code, "dealer": dealer.name}, quick=["2"])]

    if intent == "tools":
        rows = session.exec(select(ToolLease, Tool).join(Tool, Tool.id == ToolLease.tool_id)
                            .where(ToolLease.mechanic_id == mechanic.id)).all()
        if not rows:
            return [_msg("🔧 No tool on lease yet. Reach *Craftsman* to unlock tool leases.", quick=["2"])]
        lines = [f"• {t.name}: {round(100 * l.points_paid / l.points_total)}% owned"
                 + (" ✅" if l.status == "owned" else "") for l, t in rows]
        return [_msg("🔧 *Fitments Pay Off Your Tools*\n" + "\n".join(lines)
                     + "\nEvery verified fitment pays half its points into your EMI.", quick=["1"])]

    if intent == "rank":
        if not mechanic.circle_id:
            return [_msg("You're not in a Guild Circle yet. A field officer will add you soon.")]
        peers = session.exec(select(Mechanic).where(Mechanic.circle_id == mechanic.circle_id)
                             .order_by(Mechanic.lifetime_points.desc())).all()
        pos = [p.id for p in peers].index(mechanic.id) + 1
        top = "\n".join(f"{i + 1}. {p.shop_name} — {p.lifetime_points:,}" for i, p in enumerate(peers[:3]))
        return [_msg(f"🏁 You are *#{pos} of {len(peers)}* in your Circle.\n{top}", quick=["1"])]

    if intent == "tread":
        m = TREAD_RE.search(text)
        if not m:
            return [_msg("📏 Send the tread depth, e.g. *tread 2.1mm*", quick=["tread 2.1mm"])]
        res = analyse(float(m.group(1)), "edges", 24, 29, 30)
        return [_msg(f"🛞 *TreadLens*: {res['verdict']} (score {res['score']}/100)\n"
                     + "\n".join("• " + f for f in res["findings"])
                     + "\n\nShare this health card with the rider? It carries your shop name.",
                     card={"type": "treadlens", **res}, quick=["3"])]

    count = session.exec(select(func.count()).select_from(Fitment)).one()
    return [_msg(f"Sorry, I didn't get that. 🙏 {count:,} fitments verified on the Guild so far.\nType *menu*.",
                 quick=["menu"])]
