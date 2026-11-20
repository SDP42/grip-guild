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
        {"q": "Largest puncture usually repairable on a two-wheeler tread?",
         "options": ["6 mm", "15 mm", "Any size", "Sidewall cuts too"], "a": 0},
        {"q": "After a repair you should always…",
         "options": ["Skip the leak test", "Leak test with soapy water", "Over-inflate by 10 psi", "Fit a tube"], "a": 1},
    ],
    "ev-tyres": [
        {"q": "Why do EV scooter rear tyres wear faster?",
         "options": ["Instant motor torque", "Lighter batteries", "Lower speeds", "No engine heat"], "a": 0},
        {"q": "What matters most when picking an EV tyre?",
         "options": ["Colour", "Load rating and rolling resistance", "Tread depth only", "Brand of rim"], "a": 1},
        {"q": "Which tyre issue do EV riders notice more than petrol riders?",
         "options": ["Road noise", "Exhaust smell", "Chain slack", "Clutch wear"], "a": 0},
    ],
    "treadlens": [
        {"q": "Wear in the centre of the tread usually means…",
         "options": ["Under-inflation", "Over-inflation", "Misalignment", "New tyre"], "a": 1},
        {"q": "Wear on both edges usually means…",
         "options": ["Under-inflation", "Over-inflation", "Perfect pressure", "Wrong rim"], "a": 0},
        {"q": "A common legal minimum tread depth is…",
         "options": ["0.5 mm", "1.6 mm", "4 mm", "6 mm"], "a": 1},
    ],
    "safe-fit": [
        {"q": "Before fitting a new tyre, always inspect…",
         "options": ["The rim for cracks and dents", "The headlight", "The seat", "Fuel level"], "a": 0},
        {"q": "Wheel nuts and axle bolts should be tightened…",
         "options": ["As hard as possible", "To the specified torque", "By hand only", "Only next service"], "a": 1},
        {"q": "Wobble at speed after fitting usually needs…",
         "options": ["Wheel balancing", "More air", "A new chain", "Nothing"], "a": 0},
    ],
    "talk-to-riders": [
        {"q": "The best way to show a rider their tyre is worn?",
         "options": ["Say 'trust me'", "Show the TreadLens card and wear zones", "Quote the price first", "Skip it"], "a": 1},
        {"q": "A rider says it's too expensive. You should…",
         "options": ["Insist", "Explain safety and km left, offer options", "Refuse service", "Give up"], "a": 1},
        {"q": "After the job, send the rider…",
         "options": ["Nothing", "Their health card and next check date", "A random ad", "A bill only"], "a": 1},
    ],
    "monsoon-grip": [
        {"q": "In the monsoon the most important tyre check is…",
         "options": ["Tread depth for water clearance", "Tyre colour", "Valve cap colour", "Brand logo"], "a": 0},
        {"q": "Low pressure in the rain causes…",
         "options": ["Better grip", "Aquaplaning risk", "Faster charging", "Nothing"], "a": 1},
        {"q": "A Monsoon Grip Drive check takes about…",
         "options": ["20 seconds with TreadLens", "1 hour", "A full day", "A week"], "a": 0},
    ],
}


LESSONS = {
    "tubeless-101": ["Find the puncture with soapy water", "Ream the hole and insert a patch-plug from inside",
                     "Seat the bead, inflate to spec, leak test"],
    "ev-tyres": ["Instant torque scrubs the rear tread", "Check the load index against battery weight",
                 "Low rolling resistance extends range"],
    "treadlens": ["Measure tread at three points", "Read the wear pattern", "Share the health card with the rider"],
    "safe-fit": ["Inspect the rim", "Torque to spec", "Balance the wheel"],
    "talk-to-riders": ["Show, don't tell", "Talk km left and safety, not price", "Book the next check"],
    "monsoon-grip": ["Tread depth clears water", "Pressure prevents aquaplaning", "Run the seasonal quest"],
}


@router.get("/academy/{slug}/lesson")
def lesson(slug: str, session: Session = Depends(get_session)):
    mod = session.exec(select(Module).where(Module.slug == slug)).first()
    if not mod:
        raise HTTPException(404, "Unknown module")
    return {**mod.model_dump(), "steps": LESSONS.get(slug, [])}


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
    if session.exec(select(Certification).where(Certification.mechanic_id == body.mechanic_id,
                                                Certification.module_id == mod.id)).first():
        return {"passed": True, "score": score, "badge": mod.badge, "points": 0, "verify_code": None, "already": True}
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
