"""Playable personas — every stakeholder in the Guild ecosystem gets a front door."""
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..models import District, Mechanic

router = APIRouter(prefix="/api/personas", tags=["personas"])

STORIES = {
    "ravi": {"role": "Puncture-shop owner", "hook": "Doesn't stock Eurogrip — sells it anyway through Ghost Shelf and referrals.",
             "try": ["Order from Ghost Shelf", "Refer a rider", "Watch the tyre-changer EMI move"], "accent": "#FFB020"},
    "gurpreet": {"role": "Grandmaster garage owner", "hook": "Stocks Eurogrip, mentors a Guild Circle of 9 shops.",
                 "try": ["Check the Circle leaderboard", "Run a Seasonal Quest", "Lease the nitrogen inflator"], "accent": "#FF5A1F"},
    "imran": {"role": "New Apprentice (day 6)", "hook": "Just joined. One fitment away from his first streak.",
              "try": ["Do the first scan", "Pass the Tubeless quiz", "See what Craftsman unlocks"], "accent": "#9CA3AF"},
    "lakshmi": {"role": "EV scooter specialist", "hook": "Runs an EV-first garage; the EV Pioneer quest is built for her.",
                "try": ["EV Pioneer quest", "TreadLens on an EV tyre", "Guild Passport credit line"], "accent": "#C6FF3D"},
}

OTHERS = [
    {"slug": "priya", "kind": "rider", "name": "Priya Nair", "role": "Gig delivery rider, Pune",
     "hook": "A flat tyre costs her a shift. Puncture SOS finds a Guild shop in minutes.",
     "try": ["Trigger Puncture SOS", "Check if her tyre is genuine", "Rate the mechanic"], "href": "/rider", "accent": "#38BDF8"},
    {"slug": "dealer", "kind": "dealer", "name": "Balaji Tyres", "role": "Eurogrip dealer, Pune",
     "hook": "Redeems mechanic referral codes and fulfils Ghost Shelf orders.",
     "try": ["Redeem a referral code", "Dispatch a Ghost Shelf order"], "href": "/dealer", "accent": "#A78BFA"},
    {"slug": "anita", "kind": "field", "name": "Anita Desai", "role": "Eurogrip field officer",
     "hook": "Covers 140 shops. The Nudge Engine tells her who needs a visit today.",
     "try": ["Open today's nudges", "Mark a visit done"], "href": "/field", "accent": "#F43F5E"},
    {"slug": "brand", "kind": "brand", "name": "Brand Manager", "role": "Eurogrip marketing",
     "hook": "Sees the whole Guild: funnel, lift vs control, fraud and budget autopilot.",
     "try": ["Read the Lift Engine", "Run Budget Autopilot", "Simulate national rollout"], "href": "/command", "accent": "#F4F1EA"},
]


@router.get("")
def personas(session: Session = Depends(get_session)):
    rows = session.exec(select(Mechanic, District).join(District, District.id == Mechanic.district_id)
                        .where(Mechanic.persona != None)).all()  # noqa: E711
    mech = [{"slug": m.persona, "kind": "mechanic", "name": m.name, "shop": m.shop_name, "district": d.name,
             "tier": m.tier, "href": f"/app?persona={m.persona}", **STORIES[m.persona]} for m, d in rows]
    order = list(STORIES)
    mech.sort(key=lambda x: order.index(x["slug"]))
    from .ecosystem import dealer_persona
    dealer = dealer_persona(session)
    others = [{**o, "name": dealer["name"]} if o["slug"] == "dealer" else o for o in OTHERS]
    return mech + others
