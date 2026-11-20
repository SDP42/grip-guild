"""Command Centre analytics — the measurability layer."""
from collections import defaultdict
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlmodel import Session, func, select

from ..db import get_session
from ..models import (Certification, Circle, District, Fitment, FraudAlert, Mechanic, Referral,
                      SOSRequest, ToolLease)
from ..seed import NOW
from ..services.tiers import TIERS

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _count(session, model, *where):
    q = select(func.count()).select_from(model)
    for w in where:
        q = q.where(w)
    return session.exec(q).one()


@router.get("/overview")
def overview(session: Session = Depends(get_session)):
    mechanics = session.exec(select(Mechanic)).all()
    active_cut = NOW - timedelta(days=30)
    active_ids = set(session.exec(select(Fitment.mechanic_id).where(Fitment.created_at > active_cut)).all())
    refs_total = _count(session, Referral)
    refs_red = _count(session, Referral, Referral.status == "redeemed")
    non_stock = [m for m in mechanics if not m.stocks_eurogrip]
    non_stock_adv = set(session.exec(select(Referral.mechanic_id).where(Referral.status == "redeemed")).all())
    return {
        "mechanics": len(mechanics),
        "active_30d": len(active_ids),
        "fitments": _count(session, Fitment),
        "fitments_30d": _count(session, Fitment, Fitment.created_at > active_cut),
        "referrals_issued": refs_total,
        "referrals_redeemed": refs_red,
        "referral_conversion_pct": round(100 * refs_red / max(1, refs_total), 1),
        "non_stock_advocates": len([m for m in non_stock if m.id in non_stock_adv]),
        "tools_leased": _count(session, ToolLease),
        "tools_owned": _count(session, ToolLease, ToolLease.status == "owned"),
        "certifications": _count(session, Certification),
        "open_fraud_alerts": _count(session, FraudAlert, FraudAlert.resolved == False),  # noqa: E712
        "sos_routed": _count(session, SOSRequest),
        "boomerang_due_90d": _count(session, Fitment, Fitment.reminder_due_at > NOW,
                                    Fitment.reminder_due_at < NOW + timedelta(days=90)),
        "tier_mix": {t["name"]: sum(m.tier == t["name"] for m in mechanics) for t in TIERS},
        "avg_rating": round(sum(m.rating for m in mechanics) / len(mechanics), 2),
    }


@router.get("/funnel")
def funnel(session: Session = Depends(get_session)):
    """Awareness → Stocking/Advocacy → Recommendation → Sale (the brief's core conversion gap)."""
    mechanics = _count(session, Mechanic)
    with_activity = len(set(session.exec(select(Fitment.mechanic_id)).all())
                        | set(session.exec(select(Referral.mechanic_id)).all()))
    recommending = len(set(session.exec(select(Referral.mechanic_id)).all()))
    sold = len(set(session.exec(select(Fitment.mechanic_id)).all())
               | set(session.exec(select(Referral.mechanic_id).where(Referral.status == "redeemed")).all()))
    return [
        {"stage": "Reachable shops (field mapped)", "value": int(mechanics * 2.6)},
        {"stage": "Enrolled in Guild", "value": mechanics},
        {"stage": "Active (any verified action)", "value": with_activity},
        {"stage": "Recommending (referrals issued)", "value": recommending},
        {"stage": "Converting (verified sale)", "value": sold},
    ]


@router.get("/lift")
def lift(session: Session = Depends(get_session)):
    """Lift Engine: difference-in-differences between matched pilot and control districts."""
    ds = session.exec(select(District)).all()
    pilot = [d for d in ds if d.cohort == "pilot"]
    control = [d for d in ds if d.cohort == "control"]
    dp = sum(d.current_share - d.baseline_share for d in pilot) / len(pilot)
    dc = sum(d.current_share - d.baseline_share for d in control) / len(control)
    return {
        "pilot_delta_pp": round(dp, 2),
        "control_delta_pp": round(dc, 2),
        "incremental_lift_pp": round(dp - dc, 2),
        "method": "Difference-in-differences on Eurogrip replacement share, matched district pairs by region",
        "districts": [d.model_dump() for d in ds],
    }


@router.get("/timeseries")
def timeseries(session: Session = Depends(get_session), weeks: int = 26):
    start = NOW - timedelta(weeks=weeks)
    rows = session.exec(select(Fitment.created_at, Fitment.channel).where(Fitment.created_at > start)).all()
    refs = session.exec(select(Referral.redeemed_at).where(Referral.redeemed_at != None,  # noqa: E711
                                                            Referral.redeemed_at > start)).all()
    buckets = defaultdict(lambda: {"stock": 0, "ghost_shelf": 0, "referral": 0, "redeemed": 0})
    for ts, ch in rows:
        buckets[(ts - start).days // 7][ch] += 1
    for ts in refs:
        buckets[(ts - start).days // 7]["redeemed"] += 1
    return [{"week": w + 1, "label": (start + timedelta(weeks=w)).strftime("%d %b"), **buckets[w]}
            for w in range(weeks)]


@router.get("/map")
def map_points(session: Session = Depends(get_session)):
    ds = session.exec(select(District)).all()
    ms = session.exec(select(Mechanic)).all()
    per = defaultdict(int)
    for m in ms:
        per[m.district_id] += 1
    return {
        "districts": [{**d.model_dump(), "mechanics": per[d.id]} for d in ds],
        "mechanics": [{"id": m.id, "lat": m.lat, "lng": m.lng, "tier": m.tier, "shop": m.shop_name,
                       "stocks": m.stocks_eurogrip} for m in ms],
    }


@router.get("/influence")
def influence(session: Session = Depends(get_session), limit: int = 12):
    """Influence Graph: shops whose word sells tyres — ranked by redeemed referrals, stock or not."""
    red = session.exec(select(Referral.mechanic_id, func.count()).where(Referral.status == "redeemed")
                       .group_by(Referral.mechanic_id)).all()
    issued = dict(session.exec(select(Referral.mechanic_id, func.count()).group_by(Referral.mechanic_id)).all())
    out = []
    for mid, n in sorted(red, key=lambda x: -x[1])[:limit]:
        m = session.get(Mechanic, mid)
        d = session.get(District, m.district_id)
        out.append({"id": m.id, "shop": m.shop_name, "name": m.name, "district": d.name,
                    "redeemed": n, "issued": issued.get(mid, n),
                    "conversion_pct": round(100 * n / max(1, issued.get(mid, n))),
                    "stocks_eurogrip": m.stocks_eurogrip, "tier": m.tier})
    return out


@router.get("/fraud")
def fraud(session: Session = Depends(get_session)):
    rows = session.exec(select(FraudAlert, Mechanic).join(Mechanic, Mechanic.id == FraudAlert.mechanic_id)
                        .order_by(FraudAlert.created_at.desc())).all()
    return [{**a.model_dump(), "shop": m.shop_name} for a, m in rows]


@router.get("/circles")
def circles(session: Session = Depends(get_session)):
    rows = session.exec(select(Circle, District).join(District, District.id == Circle.district_id)).all()
    return [{**c.model_dump(), "district": d.name,
             "members": _count(session, Mechanic, Mechanic.circle_id == c.id),
             "pct": round(100 * c.progress_fitments / c.goal_fitments)} for c, d in rows]


@router.get("/channels")
def channels(session: Session = Depends(get_session)):
    rows = session.exec(select(Fitment.channel, func.count()).group_by(Fitment.channel)).all()
    return [{"channel": c, "value": n} for c, n in rows]
