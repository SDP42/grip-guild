"""Advocacy endpoints: fitment scans, referrals, Ghost Shelf, tools, tiers."""
import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..models import Dealer, Fitment, FraudAlert, Mechanic, Referral, Tool, ToolLease
from ..services.fraud import check_scan, haversine_km
from ..services.notify import notify
from ..services.tiers import TIERS, tier_for, tier_rank

router = APIRouter(prefix="/api", tags=["advocacy"])
POINTS = {"stock": 50, "ghost_shelf": 60, "referral": 80}


class ScanIn(BaseModel):
    mechanic_id: int
    serial: str
    tyre_model: str = "Protorq Extreme"
    vehicle: str = "Splendor+"
    lat: float | None = None
    lng: float | None = None


def _credit(session: Session, m: Mechanic, pts: int) -> dict:
    before = m.tier
    m.points += pts
    m.lifetime_points += pts
    m.tier = tier_for(m.lifetime_points)
    lease = session.exec(select(ToolLease).where(ToolLease.mechanic_id == m.id,
                                                 ToolLease.status == "active")).first()
    emi = None
    if lease:
        share = pts // 2
        lease.points_paid = min(lease.points_total, lease.points_paid + share)
        lease.status = "owned" if lease.points_paid >= lease.points_total else "active"
        session.add(lease)
        emi = {"paid": share, "pct": round(100 * lease.points_paid / lease.points_total)}
    session.add(m)
    return {"tier_up": m.tier if m.tier != before else None, "emi": emi}


@router.post("/scan")
def scan(body: ScanIn, session: Session = Depends(get_session)):
    m = session.get(Mechanic, body.mechanic_id)
    if not m:
        raise HTTPException(404, "Mechanic not found")
    now = datetime.now()
    serial = body.serial.strip().upper()
    exists = session.exec(select(Fitment).where(Fitment.serial == serial)).first() is not None
    recent = session.exec(select(Fitment.created_at).where(
        Fitment.mechanic_id == m.id, Fitment.created_at > now - timedelta(minutes=10))).all()
    flags = check_scan(serial_exists=exists, recent_scan_times=list(recent), now=now,
                       shop_lat=m.lat, shop_lng=m.lng, scan_lat=body.lat, scan_lng=body.lng)
    if flags:
        for f in flags:
            session.add(FraudAlert(mechanic_id=m.id, created_at=now, **f))
        session.commit()
        return {"ok": False, "flags": flags}
    channel = "stock" if m.stocks_eurogrip else "ghost_shelf"
    pts = POINTS[channel]
    session.add(Fitment(mechanic_id=m.id, serial=serial, tyre_model=body.tyre_model, vehicle=body.vehicle,
                        rider_phone_masked="+91 9XXXX XX17", points=pts, channel=channel, created_at=now,
                        reminder_due_at=now + timedelta(days=420)))
    extra = _credit(session, m, pts)
    session.commit()
    return {"ok": True, "points": pts, "channel": channel, "balance": m.points, "tier": m.tier, **extra}


class ReferralIn(BaseModel):
    mechanic_id: int
    tyre_model: str = "Protorq Extreme"


@router.post("/referrals")
def create_referral(body: ReferralIn, session: Session = Depends(get_session)):
    m = session.get(Mechanic, body.mechanic_id)
    if not m:
        raise HTTPException(404, "Mechanic not found")
    dealers = session.exec(select(Dealer).where(Dealer.district_id == m.district_id)).all()
    dealer = min(dealers, key=lambda d: haversine_km(m.lat, m.lng, d.lat, d.lng))
    code = "GG-" + "".join(random.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5))
    r = Referral(code=code, mechanic_id=m.id, dealer_id=dealer.id, tyre_model=body.tyre_model,
                 status="issued", created_at=datetime.now())
    session.add(r)
    session.commit()
    return {"code": code, "dealer": dealer.name, "km": round(haversine_km(m.lat, m.lng, dealer.lat, dealer.lng), 1),
            "share_text": f"{m.shop_name} recommends Eurogrip {body.tyre_model}. Show code {code} at "
                          f"{dealer.name} for a free fitting check."}


@router.post("/referrals/{code}/redeem")
def redeem(code: str, session: Session = Depends(get_session)):
    r = session.exec(select(Referral).where(Referral.code == code.upper())).first()
    if not r:
        raise HTTPException(404, "Unknown code")
    if r.status != "issued":
        raise HTTPException(409, f"Code already {r.status}")
    r.status, r.redeemed_at = "redeemed", datetime.now()
    m = session.get(Mechanic, r.mechanic_id)
    session.add(r)
    extra = _credit(session, m, POINTS["referral"])
    dealer = session.get(Dealer, r.dealer_id)
    notify(session, m.id, "referral", f"Referral {r.code} redeemed: +{POINTS['referral']} pts",
           f"Your rider bought {r.tyre_model} at {dealer.name}. Your word sold a Eurogrip.", "/app/refer")
    session.commit()
    return {"ok": True, "mechanic": m.shop_name, "points": POINTS["referral"], **extra}


@router.get("/ghost-shelf/{mechanic_id}")
def ghost_shelf(mechanic_id: int, session: Session = Depends(get_session)):
    """Virtual shelf for shops that don't stock Eurogrip: nearest dealer delivers to the shop."""
    m = session.get(Mechanic, mechanic_id)
    dealers = session.exec(select(Dealer).where(Dealer.district_id == m.district_id)).all()
    dealer = min(dealers, key=lambda d: haversine_km(m.lat, m.lng, d.lat, d.lng))
    catalogue = [
        ("Protorq Extreme", "90/90-17", 1690, "Sport commuter, max grip"),
        ("Bee Connect", "90/100-10", 1390, "Scooter, long life"),
        ("Duratrail", "80/100-18", 1240, "Daily commuter, value"),
        ("Climber", "3.00-18", 1180, "Rural roads, tough"),
        ("Vento", "100/80-17", 1850, "Premium street"),
        ("Bee Connect EV", "90/90-12", 1520, "EV scooter, low rolling resistance"),
    ]
    return {
        "dealer": dealer.name, "sla_hours": dealer.ghost_shelf_sla_hours,
        "km": round(haversine_km(m.lat, m.lng, dealer.lat, dealer.lng), 1),
        "items": [{"model": a, "size": b, "mrp": c, "tag": d, "fitment_points": POINTS["ghost_shelf"]}
                  for a, b, c, d in catalogue],
    }


@router.get("/tiers")
def tiers():
    return TIERS


@router.get("/tools")
def tools(session: Session = Depends(get_session)):
    return [t.model_dump() for t in session.exec(select(Tool)).all()]


class LeaseIn(BaseModel):
    mechanic_id: int
    tool_id: int


@router.post("/tools/lease")
def lease_tool(body: LeaseIn, session: Session = Depends(get_session)):
    m, t = session.get(Mechanic, body.mechanic_id), session.get(Tool, body.tool_id)
    if not m or not t:
        raise HTTPException(404, "Not found")
    if tier_rank(m.tier) < tier_rank(t.tier_required):
        raise HTTPException(403, f"Reach {t.tier_required} to unlock {t.name}")
    if session.exec(select(ToolLease).where(ToolLease.mechanic_id == m.id, ToolLease.status == "active")).first():
        raise HTTPException(409, "Finish your current tool EMI first")
    down = min(m.points, t.points_cost // 10)
    m.points -= down
    lease = ToolLease(mechanic_id=m.id, tool_id=t.id, points_paid=down, points_total=t.points_cost,
                      started_at=datetime.now())
    session.add_all([m, lease])
    session.commit()
    return {"ok": True, "tool": t.name, "down_payment_points": down,
            "fitments_to_own": (t.points_cost - down) // 25}
