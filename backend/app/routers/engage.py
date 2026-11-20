"""Engagement endpoints: Guild Bot, TreadLens, Academy, Puncture SOS, Simulator, verification."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..models import Certification, District, Mechanic, Module
from ..services import bot
from ..services.fraud import haversine_km
from ..services.simulator import DEFAULT_MIX, DEFAULTS, simulate
from ..services.treadlens import analyse

router = APIRouter(prefix="/api", tags=["engage"])


class BotIn(BaseModel):
    mechanic_id: int
    text: str


@router.post("/bot")
def bot_message(body: BotIn, session: Session = Depends(get_session)):
    m = session.get(Mechanic, body.mechanic_id)
    if not m:
        raise HTTPException(404, "Mechanic not found")
    return {"messages": bot.reply(session, m, body.text)}


class TreadIn(BaseModel):
    tread_mm: float
    pattern: str = "even"
    psi: float = 29
    recommended_psi: float = 29
    age_months: int = 18
    cracks: bool = False


@router.post("/treadlens")
def treadlens(body: TreadIn):
    return analyse(body.tread_mm, body.pattern, body.psi, body.recommended_psi, body.age_months, body.cracks)


@router.get("/academy")
def academy(session: Session = Depends(get_session)):
    return [m.model_dump() for m in session.exec(select(Module)).all()]


QUIZ = {
    "tubeless-101": [
        {"q": "Best permanent fix for a tread puncture on a tubeless tyre?",
         "options": ["Plug from outside only", "Patch-plug from inside", "Tube inside", "Sealant only"], "a": 1},
        {"q": "Maximum puncture size usually repairable on a 2W tread?",
         "options": ["6 mm", "15 mm", "Any size", "Sidewall cuts too"], "a": 0},
        {"q": "After repair you should always…",
         "options": ["Skip leak test", "Leak test with soapy water", "Over-inflate 10 psi", "Fit a tube"], "a": 1},
    ],
}


@router.get("/academy/{slug}/quiz")
def quiz(slug: str):
    return [{"q": x["q"], "options": x["options"]} for x in QUIZ.get(slug, QUIZ["tubeless-101"])]


class QuizIn(BaseModel):
    mechanic_id: int
    answers: list[int]


@router.post("/academy/{slug}/submit")
def submit_quiz(slug: str, body: QuizIn, session: Session = Depends(get_session)):
    qs = QUIZ.get(slug, QUIZ["tubeless-101"])
    right = sum(1 for q, a in zip(qs, body.answers) if q["a"] == a)
    score = round(100 * right / len(qs))
    mod = session.exec(select(Module).where(Module.slug == slug)).first()
    if score < 66 or not mod:
        return {"passed": False, "score": score}
    code = f"GC-{body.mechanic_id:04d}-{mod.id:02d}{datetime.now():%H%M}"
    session.add(Certification(mechanic_id=body.mechanic_id, module_id=mod.id, score=score, verify_code=code,
                              issued_at=datetime.now()))
    m = session.get(Mechanic, body.mechanic_id)
    m.points += mod.points
    m.lifetime_points += mod.points
    session.add(m)
    session.commit()
    return {"passed": True, "score": score, "badge": mod.badge, "points": mod.points, "verify_code": code}


@router.get("/verify/{code}")
def verify(code: str, session: Session = Depends(get_session)):
    """Living Shop Board / certificate verification — what a rider sees after scanning the board QR."""
    c = session.exec(select(Certification).where(Certification.verify_code == code)).first()
    if not c:
        raise HTTPException(404, "Not a valid Guild credential")
    m = session.get(Mechanic, c.mechanic_id)
    mod = session.get(Module, c.module_id)
    return {"valid": True, "shop": m.shop_name, "name": m.name, "tier": m.tier, "badge": mod.badge,
            "rating": m.rating, "ratings_count": m.ratings_count, "issued_at": c.issued_at}


class SOSIn(BaseModel):
    lat: float
    lng: float


@router.post("/sos")
def sos(body: SOSIn, session: Session = Depends(get_session)):
    """Puncture SOS: route a stranded rider to the 3 nearest Guild shops (brand sends mechanics leads)."""
    ms = session.exec(select(Mechanic)).all()
    ranked = sorted(ms, key=lambda m: haversine_km(body.lat, body.lng, m.lat, m.lng))[:3]
    out = []
    for m in ranked:
        km = haversine_km(body.lat, body.lng, m.lat, m.lng)
        d = session.get(District, m.district_id)
        out.append({"id": m.id, "shop": m.shop_name, "name": m.name, "tier": m.tier, "rating": m.rating,
                    "km": round(km, 1), "eta_min": int(km * 4 + 3), "district": d.name,
                    "lat": m.lat, "lng": m.lng, "tubeless_certified": m.lifetime_points > 1500})
    return out


class SimIn(BaseModel):
    budget_cr: float = 25
    districts: int = 120
    months: int = 12
    mix: dict | None = None
    assumptions: dict | None = None


@router.post("/simulate")
def run_sim(body: SimIn):
    return simulate(body.budget_cr, body.districts, body.months, body.mix, body.assumptions)


@router.get("/simulate/defaults")
def sim_defaults():
    return {"mix": DEFAULT_MIX, "assumptions": DEFAULTS}
