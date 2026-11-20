from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select

from ..db import get_session
from ..models import (Certification, Circle, District, Fitment, FraudAlert, Mechanic, Module,
                      Referral, RiderRating, Tool, ToolLease, TreadCheck)
from ..services.quests import progress
from ..seed import NOW
from ..services.scoring import guild_score
from ..services.tiers import TIERS, next_tier

router = APIRouter(prefix="/api/mechanics", tags=["mechanics"])


def persona_id(session: Session, slug: str = "ravi") -> int:
    m = session.exec(select(Mechanic).where(Mechanic.persona == slug)).first()
    if not m:
        raise HTTPException(404, f"Unknown persona '{slug}'")
    return m.id


def score_for(session: Session, m: Mechanic) -> dict:
    since = NOW - timedelta(days=90)
    fit = session.exec(select(func.count()).select_from(Fitment).where(
        Fitment.mechanic_id == m.id, Fitment.created_at > since)).one()
    red = session.exec(select(func.count()).select_from(Referral).where(
        Referral.mechanic_id == m.id, Referral.status == "redeemed", Referral.created_at > since)).one()
    certs = session.exec(select(func.count()).select_from(Certification).where(
        Certification.mechanic_id == m.id)).one()
    fraud = session.exec(select(func.count()).select_from(FraudAlert).where(
        FraudAlert.mechanic_id == m.id, FraudAlert.resolved == False)).one()  # noqa: E712
    return guild_score(fitments_90d=fit, redeemed_90d=red, rating=m.rating, ratings_count=m.ratings_count,
                       certs=certs, streak_weeks=m.streak_weeks, open_fraud=fraud)


@router.get("")
def list_mechanics(session: Session = Depends(get_session), district_id: int | None = None,
                   tier: str | None = None, limit: int = 400):
    q = select(Mechanic, District).join(District, District.id == Mechanic.district_id)
    if district_id:
        q = q.where(Mechanic.district_id == district_id)
    if tier:
        q = q.where(Mechanic.tier == tier)
    rows = session.exec(q.limit(limit)).all()
    return [{**m.model_dump(), "district": d.name, "state": d.state, "cohort": d.cohort} for m, d in rows]


@router.get("/me")
def me(persona: str = "ravi", session: Session = Depends(get_session)):
    return profile(persona_id(session, persona), session)


@router.get("/leaderboard")
def leaderboard(session: Session = Depends(get_session), limit: int = 20):
    rows = session.exec(select(Mechanic, District).join(District, District.id == Mechanic.district_id)
                        .order_by(Mechanic.lifetime_points.desc()).limit(limit)).all()
    return [{"id": m.id, "name": m.name, "shop": m.shop_name, "district": d.name, "tier": m.tier,
             "lifetime_points": m.lifetime_points, "stocks_eurogrip": m.stocks_eurogrip,
             "rating": m.rating} for m, d in rows]


@router.get("/{mechanic_id}")
def profile(mechanic_id: int, session: Session = Depends(get_session)):
    m = session.get(Mechanic, mechanic_id)
    if not m:
        raise HTTPException(404, "Mechanic not found")
    d = session.get(District, m.district_id)
    circle = session.get(Circle, m.circle_id) if m.circle_id else None
    nt = next_tier(m.lifetime_points)
    leases = session.exec(select(ToolLease, Tool).join(Tool, Tool.id == ToolLease.tool_id)
                          .where(ToolLease.mechanic_id == m.id)).all()
    certs = session.exec(select(Certification, Module).join(Module, Module.id == Certification.module_id)
                         .where(Certification.mechanic_id == m.id)).all()
    fits = session.exec(select(Fitment).where(Fitment.mechanic_id == m.id)
                        .order_by(Fitment.created_at.desc())).all()
    refs = session.exec(select(Referral).where(Referral.mechanic_id == m.id)).all()
    boomerang = [f for f in fits if NOW < f.reminder_due_at < NOW + timedelta(days=120)]
    by_channel = {c: sum(1 for f in fits if f.channel == c) for c in ("stock", "ghost_shelf", "referral")}
    score = score_for(session, m)
    current = next(t for t in TIERS if t["name"] == m.tier)
    return {
        "mechanic": m.model_dump(),
        "district": d.model_dump(),
        "circle": circle.model_dump() if circle else None,
        "tier": current,
        "next_tier": nt,
        "tier_progress": (round(100 * (m.lifetime_points - current["min"]) / (nt["min"] - current["min"]))
                          if nt else 100),
        "guild_score": score,
        "leases": [{**l.model_dump(), "tool": t.model_dump(),
                    "pct": round(100 * l.points_paid / l.points_total)} for l, t in leases],
        "certifications": [{**c.model_dump(), "module": mo.model_dump()} for c, mo in certs],
        "recent_fitments": [f.model_dump() for f in fits[:12]],
        "fitments_total": len(fits),
        "fitments_by_channel": by_channel,
        "referrals": {"issued": len(refs), "redeemed": sum(r.status == "redeemed" for r in refs),
                      "conversion_pct": round(100 * sum(r.status == "redeemed" for r in refs) / max(1, len(refs)))},
        "boomerang_upcoming": len(boomerang),
        "passport": passport(m, score, len(fits)),
        "quests": quest_progress(session, m, fits, refs),
        "ratings": [r.model_dump() for r in session.exec(
            select(RiderRating).where(RiderRating.mechanic_id == m.id).order_by(RiderRating.created_at.desc())).all()[:5]],
    }


def quest_progress(session: Session, m: Mechanic, fits, refs) -> list[dict]:
    since = NOW - timedelta(days=60)
    checks = session.exec(select(func.count()).select_from(TreadCheck).where(
        TreadCheck.mechanic_id == m.id, TreadCheck.created_at > since)).one()
    ev = sum(1 for f in fits if f.vehicle in ("Ather 450X", "Ola S1"))
    return progress({
        "tread_checks": checks,
        "fitments": sum(1 for f in fits if f.created_at > since),
        "ev_fitments": ev,
        "redeemed": sum(1 for r in refs if r.status == "redeemed" and r.created_at > NOW - timedelta(days=30)),
    })


def passport(m: Mechanic, score: dict, fitments: int) -> dict:
    """Guild Passport: verified work history → a credit/insurance eligibility signal."""
    months = max(1, (NOW - m.joined_at).days // 30)
    limit = int(min(150000, score["score"] * 60 + fitments * 400) // 1000 * 1000)
    return {
        "verified_months": months,
        "verified_fitments": fitments,
        "credit_line_inr": limit,
        "insurance": "Shop + accident cover eligible" if score["score"] >= 400 else "Unlocks at Guild Score 400",
        "partner": "NBFC partner (illustrative)",
    }
