"""Cross-persona flows: every action here changes state another persona can see."""
import random
from datetime import datetime, timedelta
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, func, select

from ..db import get_session
from ..models import (Certification, Circle, CreditApplication, District, FraudAlert, Fitment, GhostOrder,
                      Mechanic, Module, Notification, QuestClaim, Referral, RiderRating, SOSRequest, ToolLease,
                      TreadCheck)
from ..seed import NOW
from ..services.coach import plan
from ..services.fraud import haversine_km
from ..services.notify import notify
from ..services.quests import QUESTS
from ..services.tiers import next_tier, tier_for
from ..services.treadlens import analyse
from .mechanics import quest_progress, score_for

router = APIRouter(prefix="/api", tags=["live"])


def _mech(session: Session, mechanic_id: int) -> Mechanic:
    m = session.get(Mechanic, mechanic_id)
    if not m:
        raise HTTPException(404, "Mechanic not found")
    return m


def _credit(session: Session, m: Mechanic, pts: int) -> None:
    before = m.tier
    m.points += pts
    m.lifetime_points += pts
    m.tier = tier_for(m.lifetime_points)
    if m.tier != before:
        notify(session, m.id, "tier", f"Level up: {m.tier}!", "A new Guild board for your shop is being dispatched.", "/app")
    session.add(m)


def _wa(text: str) -> str:
    return f"https://wa.me/?text={quote(text)}"


# ---------- Guild Coach & inbox ----------

def _boomerang_due(session: Session, mechanic_id: int):
    now = datetime.now()
    return session.exec(select(Fitment).where(Fitment.mechanic_id == mechanic_id, Fitment.reminder_sent_at == None,  # noqa: E711
                                              Fitment.reminder_due_at < now + timedelta(days=45))
                        .order_by(Fitment.reminder_due_at)).all()


@router.get("/mechanics/{mechanic_id}/coach")
def coach(mechanic_id: int, session: Session = Depends(get_session)):
    m = _mech(session, mechanic_id)
    lease = session.exec(select(ToolLease).where(ToolLease.mechanic_id == m.id, ToolLease.status == "active")).first()
    lease_info = None
    if lease:
        from ..models import Tool
        t = session.get(Tool, lease.tool_id)
        lease_info = {"name": t.name, "pct": round(100 * lease.points_paid / lease.points_total),
                      "paid": lease.points_paid, "total": lease.points_total}
    fits = session.exec(select(Fitment).where(Fitment.mechanic_id == m.id)).all()
    refs = session.exec(select(Referral).where(Referral.mechanic_id == m.id)).all()
    return plan(
        name=m.name, tier=m.tier, next_tier=next_tier(m.lifetime_points), lifetime=m.lifetime_points, lease=lease_info,
        boomerang_due=len(_boomerang_due(session, m.id)),
        open_sos=session.exec(select(func.count()).select_from(SOSRequest).where(
            SOSRequest.mechanic_id == m.id, SOSRequest.status == "requested")).one(),
        open_codes=sum(r.status == "issued" for r in refs), quests=quest_progress(session, m, fits, refs),
        stocks=m.stocks_eurogrip, streak=m.streak_weeks,
        certs=session.exec(select(func.count()).select_from(Certification).where(Certification.mechanic_id == m.id)).one(),
        rating=m.rating,
        unread=session.exec(select(func.count()).select_from(Notification).where(
            Notification.mechanic_id == m.id, Notification.read == False)).one(),  # noqa: E712
    )


@router.get("/mechanics/{mechanic_id}/inbox")
def inbox(mechanic_id: int, session: Session = Depends(get_session)):
    m = _mech(session, mechanic_id)
    notes = session.exec(select(Notification).where(Notification.mechanic_id == m.id)
                         .order_by(Notification.created_at.desc()).limit(30)).all()
    sos = session.exec(select(SOSRequest).where(SOSRequest.mechanic_id == m.id, SOSRequest.status.in_(["requested", "accepted"]))
                       .order_by(SOSRequest.created_at.desc())).all()
    due = _boomerang_due(session, m.id)[:12]
    return {
        "notifications": [n.model_dump() for n in notes],
        "unread": sum(not n.read for n in notes),
        "sos": [s.model_dump() for s in sos],
        "boomerang": [{"fitment_id": f.id, "rider": f.rider_name, "tyre_model": f.tyre_model, "vehicle": f.vehicle,
                       "serial": f.serial, "due": f.reminder_due_at.isoformat(),
                       "overdue": f.reminder_due_at < datetime.now()} for f in due],
    }


@router.post("/mechanics/{mechanic_id}/inbox/read")
def mark_read(mechanic_id: int, session: Session = Depends(get_session)):
    for n in session.exec(select(Notification).where(Notification.mechanic_id == mechanic_id, Notification.read == False)).all():  # noqa: E712
        n.read = True
        session.add(n)
    session.commit()
    return {"ok": True}


@router.get("/mechanics/{mechanic_id}/orders")
def my_orders(mechanic_id: int, session: Session = Depends(get_session)):
    rows = session.exec(select(GhostOrder).where(GhostOrder.mechanic_id == mechanic_id)
                        .order_by(GhostOrder.created_at.desc()).limit(10)).all()
    return [o.model_dump() for o in rows]


# ---------- Puncture SOS lifecycle (rider ⇄ mechanic) ----------

class SOSRequestIn(BaseModel):
    mechanic_id: int
    lat: float
    lng: float
    rider_name: str = "Priya"


@router.post("/sos/request")
def sos_request(body: SOSRequestIn, session: Session = Depends(get_session)):
    m = _mech(session, body.mechanic_id)
    km = haversine_km(body.lat, body.lng, m.lat, m.lng)
    req = SOSRequest(lat=body.lat, lng=body.lng, mechanic_id=m.id, distance_km=round(km, 1), eta_min=int(km * 4 + 3),
                     status="requested", created_at=datetime.now(), rider_name=body.rider_name)
    session.add(req)
    session.commit()
    session.refresh(req)
    out = req.model_dump()
    notify(session, m.id, "sos", f"Puncture SOS: {body.rider_name} is {req.distance_km} km away",
           "Fleet Pit Pass rider. Accept to send your ETA.", "/app/inbox")
    session.commit()
    return out


@router.get("/sos/{sos_id}")
def sos_status(sos_id: int, session: Session = Depends(get_session)):
    req = session.get(SOSRequest, sos_id)
    if not req:
        raise HTTPException(404, "SOS not found")
    m = session.get(Mechanic, req.mechanic_id)
    return {**req.model_dump(), "shop": m.shop_name, "mechanic": m.name, "tier": m.tier}


@router.post("/sos/{sos_id}/accept")
def sos_accept(sos_id: int, session: Session = Depends(get_session)):
    req = session.get(SOSRequest, sos_id)
    if not req or req.status != "requested":
        raise HTTPException(409, "This SOS is no longer open")
    req.status, req.accepted_at = "accepted", datetime.now()
    session.add(req)
    session.commit()
    session.refresh(req)
    return req.model_dump()


@router.post("/sos/{sos_id}/fixed")
def sos_fixed(sos_id: int, session: Session = Depends(get_session)):
    req = session.get(SOSRequest, sos_id)
    if not req or req.status == "fixed":
        raise HTTPException(409, "Already closed")
    req.status, req.fixed_at = "fixed", datetime.now()
    m = session.get(Mechanic, req.mechanic_id)
    _credit(session, m, 40)
    notify(session, m.id, "sos", f"SOS closed: +40 pts", f"You rescued {req.rider_name}. Ask them to rate you on your Shop Board.", "/app")
    session.add(req)
    session.commit()
    session.refresh(req)
    return req.model_dump()


# ---------- Customer Boomerang ----------

@router.post("/boomerang/{fitment_id}/send")
def boomerang_send(fitment_id: int, session: Session = Depends(get_session)):
    f = session.get(Fitment, fitment_id)
    if not f:
        raise HTTPException(404, "Fitment not found")
    m = session.get(Mechanic, f.mechanic_id)
    months = max(1, (datetime.now() - f.created_at).days // 30)
    text = (f"Hi {f.rider_name}, this is {m.shop_name}. Your {f.tyre_model} on the {f.vehicle} was fitted {months} months ago. "
            f"Drop by this week for a free tyre check. Tyre ID {f.serial}.")
    f.reminder_sent_at = datetime.now()
    session.add(f)
    session.commit()
    return {"ok": True, "message": text, "whatsapp": _wa(text)}


@router.get("/rider/messages")
def rider_messages(name: str = "Priya", session: Session = Depends(get_session)):
    """What a rider actually received: Boomerang reminders and TreadLens cards addressed to them."""
    fits = session.exec(select(Fitment, Mechanic).join(Mechanic, Mechanic.id == Fitment.mechanic_id)
                        .where(Fitment.rider_name == name, Fitment.reminder_sent_at != None)  # noqa: E711
                        .order_by(Fitment.reminder_sent_at.desc()).limit(5)).all()
    cards = session.exec(select(TreadCheck, Mechanic).join(Mechanic, Mechanic.id == TreadCheck.mechanic_id)
                         .where(TreadCheck.rider_name == name).order_by(TreadCheck.created_at.desc()).limit(5)).all()
    out = [{"kind": "boomerang", "from": m.shop_name, "at": f.reminder_sent_at.isoformat(),
            "text": f"Your {f.tyre_model} was fitted {max(1, (datetime.now() - f.created_at).days // 30)} months ago. "
                    f"Drop by for a free tyre check.", "link": f"/twin?serial={f.serial}"} for f, m in fits]
    out += [{"kind": "card", "from": m.shop_name, "at": c.created_at.isoformat(),
             "text": f"Tyre health card: {c.verdict} (score {c.score}/100).", "link": f"/card/{c.id}"} for c, m in cards]
    return sorted(out, key=lambda x: x["at"], reverse=True)


# ---------- TreadLens cards (saved, shareable) ----------

class TreadSaveIn(BaseModel):
    mechanic_id: int
    rider_name: str = "Priya"
    tread_mm: float
    psi: float = 29
    recommended_psi: float = 29
    age_months: int = 18
    pattern: str = "even"
    cracks: bool = False


@router.post("/treadlens/save")
def treadlens_save(body: TreadSaveIn, session: Session = Depends(get_session)):
    m = _mech(session, body.mechanic_id)
    res = analyse(body.tread_mm, body.pattern, body.psi, body.recommended_psi, body.age_months, body.cracks)
    fit = session.exec(select(Fitment).where(Fitment.mechanic_id == m.id).order_by(Fitment.created_at.desc())).first()
    serial = fit.serial if fit else "EG" + "".join(random.choice("0123456789ABCDEF") for _ in range(10))
    check = TreadCheck(serial=serial, mechanic_id=m.id, tread_mm=body.tread_mm, psi=body.psi, score=res["score"],
                       created_at=datetime.now(), pattern=body.pattern, verdict=res["verdict"], rider_name=body.rider_name)
    session.add(check)
    session.commit()
    session.refresh(check)
    text = (f"Hi {body.rider_name}, here is your tyre health card from {m.shop_name}: {res['verdict']} "
            f"(score {res['score']}/100). View it: /card/{check.id}")
    return {**res, "card_id": check.id, "serial": serial, "share_text": text, "whatsapp": _wa(text)}


@router.get("/cards/{card_id}")
def card(card_id: int, session: Session = Depends(get_session)):
    c = session.get(TreadCheck, card_id)
    if not c:
        raise HTTPException(404, "Card not found")
    m = session.get(Mechanic, c.mechanic_id)
    res = analyse(c.tread_mm, c.pattern, c.psi, 29, 18)
    return {**res, "id": c.id, "serial": c.serial, "tread_mm": c.tread_mm, "psi": c.psi, "rider": c.rider_name,
            "created_at": c.created_at.isoformat(), "shop": m.shop_name, "mechanic_id": m.id, "tier": m.tier,
            "rating": m.rating}


# ---------- Quests ----------

@router.post("/quests/{slug}/claim")
def claim_quest(slug: str, mechanic_id: int, session: Session = Depends(get_session)):
    m = _mech(session, mechanic_id)
    fits = session.exec(select(Fitment).where(Fitment.mechanic_id == m.id)).all()
    refs = session.exec(select(Referral).where(Referral.mechanic_id == m.id)).all()
    q = next((x for x in quest_progress(session, m, fits, refs) if x["slug"] == slug), None)
    if not q:
        raise HTTPException(404, "Unknown quest")
    if q["claimed"]:
        raise HTTPException(409, "Already claimed")
    if not q["done"]:
        raise HTTPException(400, f"Not finished yet: {q['current']}/{q['target']}")
    pts = next(x["points"] for x in QUESTS if x["slug"] == slug)
    session.add(QuestClaim(mechanic_id=m.id, quest_slug=slug, points=pts, claimed_at=datetime.now()))
    _credit(session, m, pts)
    notify(session, m.id, "quest", f"Quest reward: +{pts} pts", q["reward"], "/app/quests")
    session.commit()
    return {"ok": True, "points": pts, "balance": m.points}


# ---------- Guild Passport credit ----------

class CreditIn(BaseModel):
    mechanic_id: int
    amount_inr: int
    purpose: str = "Workshop equipment"


@router.post("/passport/apply")
def apply_credit(body: CreditIn, session: Session = Depends(get_session)):
    m = _mech(session, body.mechanic_id)
    from .mechanics import passport
    score = score_for(session, m)
    fits = session.exec(select(func.count()).select_from(Fitment).where(Fitment.mechanic_id == m.id)).one()
    limit = passport(m, score, fits)["credit_line_inr"]
    if body.amount_inr <= limit:
        status = "approved"
    elif body.amount_inr <= limit * 1.3:
        status = "review"
    else:
        status = "declined"
    emi = int(body.amount_inr * 1.14 / 12)  # illustrative 14% flat over 12 months
    app = CreditApplication(mechanic_id=m.id, amount_inr=body.amount_inr, purpose=body.purpose, status=status,
                            emi_inr=emi, created_at=datetime.now())
    session.add(app)
    session.flush()
    out = app.model_dump()
    notify(session, m.id, "credit", f"Credit application {status}",
           f"₹{body.amount_inr:,} for {body.purpose}. Limit from your verified history: ₹{limit:,}.", "/app/passport")
    session.commit()
    return {**out, "limit_inr": limit}


@router.get("/mechanics/{mechanic_id}/credit")
def credit_history(mechanic_id: int, session: Session = Depends(get_session)):
    return [a.model_dump() for a in session.exec(select(CreditApplication).where(
        CreditApplication.mechanic_id == mechanic_id).order_by(CreditApplication.created_at.desc())).all()]


# ---------- Living Shop Board (public, scanned by riders) ----------

@router.get("/board/{mechanic_id}")
def board(mechanic_id: int, session: Session = Depends(get_session)):
    m = _mech(session, mechanic_id)
    d = session.get(District, m.district_id)
    certs = session.exec(select(Module.badge).join(Certification, Certification.module_id == Module.id)
                         .where(Certification.mechanic_id == m.id)).all()
    ratings = session.exec(select(RiderRating).where(RiderRating.mechanic_id == m.id)
                           .order_by(RiderRating.created_at.desc()).limit(8)).all()
    fits = session.exec(select(func.count()).select_from(Fitment).where(Fitment.mechanic_id == m.id)).one()
    rescues = session.exec(select(func.count()).select_from(SOSRequest).where(
        SOSRequest.mechanic_id == m.id, SOSRequest.status == "fixed")).one()
    return {"id": m.id, "shop": m.shop_name, "name": m.name, "district": d.name, "state": d.state, "tier": m.tier,
            "rating": m.rating, "ratings_count": m.ratings_count, "badges": sorted(set(certs)),
            "guild_score": score_for(session, m)["score"], "verified_fitments": fits, "sos_rescues": rescues,
            "stocks_eurogrip": m.stocks_eurogrip, "member_since": m.joined_at.isoformat(),
            "reviews": [r.model_dump() for r in ratings]}


# ---------- Guild Circle ----------

@router.get("/circles/{circle_id}/members")
def circle_members(circle_id: int, session: Session = Depends(get_session)):
    c = session.get(Circle, circle_id)
    if not c:
        raise HTTPException(404, "Circle not found")
    ms = session.exec(select(Mechanic).where(Mechanic.circle_id == circle_id).order_by(Mechanic.lifetime_points.desc())).all()
    since = NOW - timedelta(days=30)
    out = []
    for m in ms:
        f30 = session.exec(select(func.count()).select_from(Fitment).where(
            Fitment.mechanic_id == m.id, Fitment.created_at > since)).one()
        out.append({"id": m.id, "shop": m.shop_name, "name": m.name, "tier": m.tier, "lifetime_points": m.lifetime_points,
                    "fitments_30d": f30, "persona": m.persona})
    return {"circle": c.model_dump(), "members": out}


# ---------- Brand: resolve fraud ----------

@router.post("/analytics/fraud/{alert_id}/resolve")
def resolve_fraud(alert_id: int, session: Session = Depends(get_session)):
    a = session.get(FraudAlert, alert_id)
    if not a:
        raise HTTPException(404, "Alert not found")
    a.resolved = True
    session.add(a)
    session.commit()
    return {"ok": True}
