"""Rider, dealer and field-officer endpoints — the rest of the Guild ecosystem."""
import random
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, func, select

from ..db import get_session
from ..models import (Dealer, District, FieldVisit, Fitment, FleetAccount, GhostOrder, Mechanic, Referral,
                      RiderRating, ToolLease, TreadCheck)
from ..seed import NOW
from ..services.autopilot import reallocate
from ..services.fraud import haversine_km
from ..services.notify import notify
from ..services.nudges import churn_risk

router = APIRouter(prefix="/api", tags=["ecosystem"])


# ---------- Rider ----------

@router.get("/rider/tyre/{serial}")
def tyre_twin(serial: str, session: Session = Depends(get_session)):
    """Tyre Twin + genuine check: the rider scans the tyre's QR."""
    f = session.exec(select(Fitment).where(Fitment.serial == serial.upper())).first()
    if not f:
        return {"genuine": False, "message": "This serial is not in Eurogrip's registry. It may be counterfeit — "
                                             "ask a Guild mechanic to check."}
    m = session.get(Mechanic, f.mechanic_id)
    checks = session.exec(select(TreadCheck).where(TreadCheck.serial == f.serial)
                          .order_by(TreadCheck.created_at)).all()
    history = [{"date": f.created_at.isoformat(), "tread_mm": 6.0, "event": "Fitted"}] + [
        {"date": c.created_at.isoformat(), "tread_mm": c.tread_mm, "event": f"TreadLens check ({c.score}/100)"} for c in checks]
    last = checks[-1].tread_mm if checks else 6.0
    return {"genuine": True, "serial": f.serial, "model": f.tyre_model, "vehicle": f.vehicle,
            "fitted_by": m.shop_name, "mechanic_tier": m.tier, "fitted_on": f.created_at.isoformat(),
            "warranty_until": (f.created_at + timedelta(days=730)).isoformat(),
            "next_check_due": f.reminder_due_at.isoformat(), "tread_now_mm": last, "history": history}


@router.get("/rider/sample-serial")
def sample_serial(session: Session = Depends(get_session)):
    """A registered serial with history, so the demo always has something to show."""
    serial = session.exec(select(TreadCheck.serial).group_by(TreadCheck.serial)
                          .having(func.count() >= 3).limit(1)).first()
    return {"serial": serial}


class RatingIn(BaseModel):
    mechanic_id: int
    stars: int
    comment: str = ""


@router.post("/rider/rate")
def rate(body: RatingIn, session: Session = Depends(get_session)):
    m = session.get(Mechanic, body.mechanic_id)
    if not m or not 1 <= body.stars <= 5:
        raise HTTPException(400, "Invalid rating")
    m.rating = round((m.rating * m.ratings_count + body.stars) / (m.ratings_count + 1), 2)
    m.ratings_count += 1
    session.add_all([m, RiderRating(mechanic_id=m.id, stars=body.stars, comment=body.comment, created_at=datetime.now())])
    notify(session, m.id, "rating", f"New {body.stars}★ rating", body.comment or "A rider rated your shop.", f"/board/{m.id}")
    session.commit()
    return {"ok": True, "new_rating": m.rating, "ratings_count": m.ratings_count}


@router.get("/fleets")
def fleets(session: Session = Depends(get_session)):
    rows = session.exec(select(FleetAccount)).all()
    return [{**f.model_dump(), "downtime_saved_hrs": round(f.jobs_30d * (75 - f.avg_downtime_min) / 60)} for f in rows]


# ---------- Dealer ----------

@router.get("/dealers")
def dealers(session: Session = Depends(get_session)):
    rows = session.exec(select(Dealer, District).join(District, District.id == Dealer.district_id)).all()
    return [{**d.model_dump(), "district": x.name} for d, x in rows]


@router.get("/dealer/{dealer_id}/queue")
def dealer_queue(dealer_id: int, session: Session = Depends(get_session)):
    d = session.get(Dealer, dealer_id)
    if not d:
        raise HTTPException(404, "Dealer not found")
    refs = session.exec(select(Referral, Mechanic).join(Mechanic, Mechanic.id == Referral.mechanic_id)
                        .where(Referral.dealer_id == dealer_id).order_by(Referral.created_at.desc())).all()
    orders = session.exec(select(GhostOrder, Mechanic).join(Mechanic, Mechanic.id == GhostOrder.mechanic_id)
                          .where(GhostOrder.dealer_id == dealer_id).order_by(GhostOrder.created_at.desc())).all()
    redeemed = [r for r, _ in refs if r.status == "redeemed"]
    return {
        "dealer": d.model_dump(),
        "stats": {"referral_sales": len(redeemed), "open_codes": sum(r.status == "issued" for r, _ in refs),
                  "ghost_orders": len(orders), "partner_shops": len({m.id for _, m in refs} | {m.id for _, m in orders})},
        "referrals": [{**r.model_dump(), "shop": m.shop_name} for r, m in refs[:30]],
        "orders": [{**o.model_dump(), "shop": m.shop_name} for o, m in orders[:30]],
    }


class GhostOrderIn(BaseModel):
    mechanic_id: int
    tyre_model: str
    size: str


@router.post("/ghost-orders")
def place_order(body: GhostOrderIn, session: Session = Depends(get_session)):
    m = session.get(Mechanic, body.mechanic_id)
    ds = session.exec(select(Dealer).where(Dealer.district_id == m.district_id)).all()
    dl = min(ds, key=lambda d: haversine_km(m.lat, m.lng, d.lat, d.lng))
    o = GhostOrder(mechanic_id=m.id, dealer_id=dl.id, tyre_model=body.tyre_model, size=body.size,
                   status="placed", created_at=datetime.now(), eta_hours=dl.ghost_shelf_sla_hours)
    session.add(o)
    session.commit()
    session.refresh(o)
    return {**o.model_dump(), "dealer": dl.name}


NEXT = {"placed": "dispatched", "dispatched": "delivered", "delivered": "fitted"}


@router.post("/ghost-orders/{order_id}/advance")
def advance(order_id: int, session: Session = Depends(get_session)):
    o = session.get(GhostOrder, order_id)
    if not o or o.status not in NEXT:
        raise HTTPException(409, "Order cannot move forward")
    o.status = NEXT[o.status]
    msg = {"dispatched": f"Your {o.tyre_model} {o.size} is on its way (ETA {o.eta_hours} h).",
           "delivered": f"{o.tyre_model} {o.size} delivered to your shop. Fit it and scan the QR to earn 60 pts.",
           "fitted": f"{o.tyre_model} marked fitted. Nice sale with zero inventory."}[o.status]
    notify(session, o.mechanic_id, "order", f"Ghost Shelf order {o.status}", msg, "/app/shelf")
    session.add(o)
    session.commit()
    session.refresh(o)
    return o.model_dump()


# ---------- Field officer ----------

@router.get("/field/nudges")
def nudges(session: Session = Depends(get_session), limit: int = 15):
    ms = session.exec(select(Mechanic)).all()
    fits = session.exec(select(Fitment.mechanic_id, Fitment.created_at)).all()
    last30, prev30 = defaultdict(int), defaultdict(int)
    for mid, ts in fits:
        age = (NOW - ts).days
        if age <= 30:
            last30[mid] += 1
        elif age <= 60:
            prev30[mid] += 1
    leases = {l.mechanic_id: round(100 * l.points_paid / l.points_total)
              for l in session.exec(select(ToolLease).where(ToolLease.status == "active")).all()}
    open_refs = defaultdict(int)
    for mid in session.exec(select(Referral.mechanic_id).where(Referral.status == "issued")).all():
        open_refs[mid] += 1
    dists = {d.id: d.name for d in session.exec(select(District)).all()}
    out = []
    for m in ms:
        r = churn_risk(fitments_prev_30=prev30[m.id], fitments_last_30=last30[m.id], streak_weeks=m.streak_weeks,
                       lease_pct=leases.get(m.id), open_referrals=open_refs[m.id],
                       days_since_join=(NOW - m.joined_at).days)
        if r["risk"] > 0:
            out.append({"id": m.id, "shop": m.shop_name, "name": m.name, "district": dists[m.district_id],
                        "tier": m.tier, "last30": last30[m.id], "prev30": prev30[m.id], **r})
    out.sort(key=lambda x: -x["risk"])
    return {"total_at_risk": sum(1 for x in out if x["level"] != "low"), "items": out[:limit]}


@router.get("/field/visits")
def visits(session: Session = Depends(get_session)):
    rows = session.exec(select(FieldVisit, Mechanic).join(Mechanic, Mechanic.id == FieldVisit.mechanic_id)
                        .order_by(FieldVisit.scheduled_for)).all()
    return [{**v.model_dump(), "shop": m.shop_name, "tier": m.tier} for v, m in rows]


class VisitIn(BaseModel):
    mechanic_id: int
    purpose: str = "nudge"
    notes: str = ""


@router.post("/field/visits")
def log_visit(body: VisitIn, session: Session = Depends(get_session)):
    v = FieldVisit(mechanic_id=body.mechanic_id, officer="Anita Desai", purpose=body.purpose, status="done",
                   scheduled_for=datetime.now(), notes=body.notes)
    session.add(v)
    session.commit()
    session.refresh(v)
    return v.model_dump()


@router.get("/analytics/autopilot")
def autopilot(session: Session = Depends(get_session), monthly_budget_lakh: float = 60):
    ds = session.exec(select(District).where(District.cohort == "pilot")).all()
    counts = dict(session.exec(select(Mechanic.district_id, func.count()).group_by(Mechanic.district_id)).all())
    rows = [{"district": d.name, "lift_pp": round(d.current_share - d.baseline_share, 2),
             "mechanics": counts.get(d.id, 0)} for d in ds]
    return reallocate(rows, monthly_budget_lakh)
