"""Deterministic demo data for Grip Guild.

All numbers are synthetic and only exist to make the prototype feel alive.
"""
import random
from datetime import datetime, timedelta

from sqlmodel import Session, SQLModel, select

from .db import engine
from .models import (
    Certification,
    Circle,
    Dealer,
    District,
    Fitment,
    FraudAlert,
    Mechanic,
    Module,
    Referral,
    SOSRequest,
    Tool,
    ToolLease,
)
from .services.tiers import tier_for

R = random.Random(42)
NOW = datetime(2026, 11, 20, 12, 0, 0)

# name, state, lat, lng, region
DISTRICTS = [
    ("Pune", "Maharashtra", 18.52, 73.86, "West"),
    ("Nashik", "Maharashtra", 20.00, 73.79, "West"),
    ("Ahmedabad", "Gujarat", 23.02, 72.57, "West"),
    ("Surat", "Gujarat", 21.17, 72.83, "West"),
    ("Jaipur", "Rajasthan", 26.91, 75.79, "North"),
    ("Jodhpur", "Rajasthan", 26.24, 73.02, "North"),
    ("Lucknow", "Uttar Pradesh", 26.85, 80.95, "North"),
    ("Kanpur", "Uttar Pradesh", 26.45, 80.33, "North"),
    ("Ludhiana", "Punjab", 30.90, 75.86, "North"),
    ("Amritsar", "Punjab", 31.63, 74.87, "North"),
    ("Patna", "Bihar", 25.59, 85.14, "East"),
    ("Gaya", "Bihar", 24.79, 85.00, "East"),
    ("Kolkata", "West Bengal", 22.57, 88.36, "East"),
    ("Siliguri", "West Bengal", 26.73, 88.40, "East"),
    ("Bhubaneswar", "Odisha", 20.30, 85.82, "East"),
    ("Cuttack", "Odisha", 20.46, 85.88, "East"),
    ("Indore", "Madhya Pradesh", 22.72, 75.86, "Central"),
    ("Bhopal", "Madhya Pradesh", 23.26, 77.41, "Central"),
    ("Raipur", "Chhattisgarh", 21.25, 81.63, "Central"),
    ("Nagpur", "Maharashtra", 21.15, 79.09, "Central"),
    ("Chennai", "Tamil Nadu", 13.08, 80.27, "South"),
    ("Madurai", "Tamil Nadu", 9.93, 78.12, "South"),
    ("Coimbatore", "Tamil Nadu", 11.02, 76.96, "South"),
    ("Bengaluru", "Karnataka", 12.97, 77.59, "South"),
    ("Hubballi", "Karnataka", 15.36, 75.12, "South"),
    ("Hyderabad", "Telangana", 17.39, 78.49, "South"),
    ("Warangal", "Telangana", 17.97, 79.59, "South"),
    ("Vijayawada", "Andhra Pradesh", 16.51, 80.65, "South"),
    ("Kochi", "Kerala", 9.93, 76.27, "South"),
    ("Guwahati", "Assam", 26.14, 91.74, "East"),
]

LANG_BY_STATE = {
    "Maharashtra": "Marathi", "Gujarat": "Gujarati", "Rajasthan": "Hindi",
    "Uttar Pradesh": "Hindi", "Punjab": "Punjabi", "Bihar": "Hindi",
    "West Bengal": "Bengali", "Odisha": "Odia", "Madhya Pradesh": "Hindi",
    "Chhattisgarh": "Hindi", "Tamil Nadu": "Tamil", "Karnataka": "Kannada",
    "Telangana": "Telugu", "Andhra Pradesh": "Telugu", "Kerala": "Malayalam",
    "Assam": "Assamese",
}

FIRST = ["Ravi", "Suresh", "Imran", "Gurpreet", "Mahesh", "Anil", "Salim", "Prakash",
         "Murugan", "Venkat", "Rakesh", "Arjun", "Faisal", "Deepak", "Biju", "Sanjay",
         "Rajesh", "Kishore", "Manoj", "Harish", "Abdul", "Ramesh", "Vinod", "Santosh",
         "Bablu", "Pappu", "Raju", "Sunil", "Joseph", "Kartik"]
LAST = ["Kumar", "Yadav", "Shaikh", "Singh", "Patil", "Reddy", "Nair", "Das", "Verma",
        "Khan", "Gowda", "Pillai", "Sharma", "Mondal", "Jadhav", "Rao", "Sahu", "Mishra"]
SHOP_SUFFIX = ["Puncture Works", "Auto Garage", "Tyre Point", "Bike Care", "Motor Works",
               "Tyre & Tube", "Two Wheeler Clinic", "Service Centre"]
SHOP_PREFIX = ["Sai", "Shree", "New", "Royal", "Laxmi", "Ganesh", "Star", "Speed",
               "Balaji", "Hind", "Friends", "Al-Madina", "Ma Durga", "Murugan", "Om"]

TYRE_MODELS = ["Protorq Extreme", "Bee Connect", "Duratrail", "Climber", "Vento",
               "Flamingo", "Durabull", "Trailhound Scrambler", "Protorq Sport"]
VEHICLES = ["Splendor+", "Activa 6G", "Pulsar 150", "Jupiter", "Apache RTR 160",
            "Classic 350", "Shine", "HF Deluxe", "Ntorq", "Ather 450X", "Ola S1", "Raider 125"]

TOOLS = [
    # name, category, mrp, tier, icon, blurb
    ("Tubeless Puncture Kit Pro", "tubeless", 900, "Apprentice", "kit", "Reamer, plugs, cement — 60 repairs."),
    ("Digital Pressure Gauge", "diagnostic", 650, "Apprentice", "gauge", "±0.5 psi accuracy, backlit."),
    ("Tread Depth Gauge", "diagnostic", 350, "Apprentice", "ruler", "Feeds TreadLens health cards."),
    ("Guild Safety Kit", "safety", 600, "Apprentice", "shield", "Gloves, goggles, knee pad."),
    ("Guild Uniform Set", "visibility", 1200, "Apprentice", "shirt", "2 shirts + cap, tier-coloured."),
    ("Bead Breaker", "changer", 3200, "Craftsman", "wrench", "Breaks stubborn beads in seconds."),
    ("LED Living Shop Board", "visibility", 4500, "Craftsman", "board", "Lit board with verify-QR."),
    ("Cordless Impact Wrench", "power", 7500, "Craftsman", "bolt", "300 Nm, two batteries."),
    ("Manual 2W Tyre Changer", "changer", 6500, "Craftsman", "changer", "Bench-mount, rim-safe jaws."),
    ("2 HP Air Compressor", "power", 18000, "Master", "air", "50 L tank, auto cut-off."),
    ("2W Wheel Balancer", "changer", 26000, "Master", "balance", "Ends wobble complaints."),
    ("Pneumatic 2W Tyre Changer", "changer", 38000, "Grandmaster", "changer", "Fits a tyre in 3 minutes."),
    ("Nitrogen Inflator (Circle Pool)", "power", 55000, "Grandmaster", "air", "Shared across a Guild Circle."),
]

MODULES = [
    ("tubeless-101", "Tubeless Repair Done Right", 12, 150, "Tubeless Certified",
     "Plug vs patch, bead seating, leak test."),
    ("ev-tyres", "EV Scooter Tyres", 15, 250, "EV Ready",
     "Instant torque wear, load ratings, hub motors."),
    ("treadlens", "Reading a Tyre", 10, 120, "TreadLens Pro",
     "Wear patterns that reveal alignment & pressure faults."),
    ("safe-fit", "Safe Fitment Standard", 8, 100, "Safe Fit",
     "Torque, balancing, rim inspection checklist."),
    ("talk-to-riders", "Talking Tyres with Riders", 9, 120, "Rider Whisperer",
     "Explain tread, grip and price in 30 seconds."),
    ("monsoon-grip", "Monsoon Grip Drive", 7, 200, "Monsoon Hero",
     "Wet grip checks and the seasonal quest."),
]


def _serial() -> str:
    return "EG" + "".join(R.choice("0123456789ABCDEF") for _ in range(10))


def _code() -> str:
    return "GG-" + "".join(R.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5))


def _mask() -> str:
    return f"+91 9{R.randint(1000, 9999)}X XX{R.randint(10, 99)}"


def seed(force: bool = False) -> None:
    from .db import init_db

    if force:
        SQLModel.metadata.drop_all(engine)
    init_db()
    with Session(engine) as s:
        if s.exec(select(District)).first():
            return

        # Districts: alternate pilot / control in matched pairs (same region).
        districts = []
        for i, (name, state, lat, lng, region) in enumerate(DISTRICTS):
            cohort = "pilot" if i % 2 == 0 else "control"
            base = round(R.uniform(6.0, 13.5), 1)
            lift = R.uniform(2.6, 5.4) if cohort == "pilot" else R.uniform(-0.3, 1.0)
            d = District(name=name, state=state, lat=lat, lng=lng, region=region,
                         cohort=cohort, baseline_share=base, current_share=round(base + lift, 1))
            s.add(d)
            districts.append(d)
        s.commit()

        dealers = []
        for d in districts:
            for k in range(2):
                dl = Dealer(name=f"{R.choice(SHOP_PREFIX)} Tyres {d.name}" + (" II" if k else ""),
                            district_id=d.id, lat=d.lat + R.uniform(-0.05, 0.05),
                            lng=d.lng + R.uniform(-0.05, 0.05),
                            ghost_shelf_sla_hours=R.choice([2, 3, 4, 6]))
                s.add(dl)
                dealers.append(dl)
        s.commit()

        circles = []
        for d in districts:
            if d.cohort != "pilot":
                continue
            for k in range(2):
                goal = R.choice([120, 150, 200])
                c = Circle(name=f"{d.name} Circle {'AB'[k]}", district_id=d.id, goal_fitments=goal,
                           progress_fitments=R.randint(int(goal * 0.3), goal),
                           unlock_reward=R.choice(["Nitrogen Inflator", "Wheel Balancer",
                                                   "Pneumatic Changer"]))
                s.add(c)
                circles.append(c)
        s.commit()

        mechanics = []
        for i in range(320):
            d = R.choice(districts)
            pilot = d.cohort == "pilot"
            lifetime = int(R.paretovariate(1.4) * 900) if pilot else R.randint(0, 400)
            lifetime = min(lifetime, 26000)
            m = Mechanic(
                name=f"{R.choice(FIRST)} {R.choice(LAST)}",
                shop_name=f"{R.choice(SHOP_PREFIX)} {R.choice(SHOP_SUFFIX)}",
                district_id=d.id,
                circle_id=R.choice([c.id for c in circles if c.district_id == d.id]) if pilot else None,
                lat=d.lat + R.uniform(-0.12, 0.12), lng=d.lng + R.uniform(-0.12, 0.12),
                language=LANG_BY_STATE[d.state], phone_masked=_mask(),
                shop_type=R.choices(["puncture", "garage", "multi-brand"], [5, 4, 2])[0],
                stocks_eurogrip=R.random() < (0.38 if pilot else 0.22),
                tier=tier_for(lifetime), points=int(lifetime * R.uniform(0.15, 0.6)),
                lifetime_points=lifetime, streak_weeks=R.randint(0, 26) if pilot else 0,
                rating=round(R.uniform(3.6, 4.95), 1), ratings_count=R.randint(3, 240),
                joined_at=NOW - timedelta(days=R.randint(10, 200)), avatar_seed=R.randint(1, 9999),
            )
            s.add(m)
            mechanics.append(m)
        # A hero mechanic for the demo app (id 1 after commit ordering is not guaranteed; we flag by name)
        hero = Mechanic(name="Ravi Kumar", shop_name="Sai Puncture Works", district_id=districts[0].id,
                        circle_id=circles[0].id, lat=18.515, lng=73.85, language="Marathi",
                        phone_masked="+91 98XXX XX42", shop_type="puncture", stocks_eurogrip=False,
                        tier="Master", points=3840, lifetime_points=7420, streak_weeks=11, rating=4.8,
                        ratings_count=164, joined_at=NOW - timedelta(days=142), avatar_seed=7)
        s.add(hero)
        s.commit()
        mechanics.append(hero)

        tools = []
        for name, cat, mrp, tier, icon, blurb in TOOLS:
            pts = int(mrp * 0.8)  # bulk procurement ≈ 20% below MRP
            t = Tool(name=name, category=cat, mrp_inr=mrp, points_cost=pts,
                     weekly_lease_points=max(25, pts // 26), tier_required=tier, icon=icon, blurb=blurb)
            s.add(t)
            tools.append(t)
        s.commit()

        for m in R.sample(mechanics, 90) + [hero]:
            t = R.choice(tools[5:])
            paid = R.randint(int(t.points_cost * 0.1), t.points_cost)
            s.add(ToolLease(mechanic_id=m.id, tool_id=t.id, points_paid=paid if m is not hero else 21400,
                            points_total=t.points_cost if m is not hero else tools[11].points_cost,
                            started_at=NOW - timedelta(days=R.randint(5, 150)),
                            status="owned" if paid >= t.points_cost else "active"))
        s.commit()
        # make sure hero's lease is the pneumatic changer
        hero_lease = s.exec(select(ToolLease).where(ToolLease.mechanic_id == hero.id)).first()
        hero_lease.tool_id = tools[11].id
        s.add(hero_lease)

        weights = [max(1, m.lifetime_points // 100) for m in mechanics]
        seen = set()
        for _ in range(2600):
            m = R.choices(mechanics, weights)[0]
            created = NOW - timedelta(days=R.betavariate(1.3, 2.4) * 180, hours=R.randint(0, 23))
            serial = _serial()
            while serial in seen:
                serial = _serial()
            seen.add(serial)
            channel = "stock" if m.stocks_eurogrip and R.random() < 0.8 else R.choice(["ghost_shelf", "referral"])
            s.add(Fitment(mechanic_id=m.id, serial=serial, tyre_model=R.choice(TYRE_MODELS),
                          vehicle=R.choice(VEHICLES), rider_phone_masked=_mask(),
                          points={"stock": 50, "ghost_shelf": 60, "referral": 80}[channel],
                          channel=channel, created_at=created,
                          reminder_due_at=created + timedelta(days=R.randint(300, 540))))
        s.commit()

        codes = set()
        for _ in range(1300):
            m = R.choices(mechanics, weights)[0]
            code = _code()
            while code in codes:
                code = _code()
            codes.add(code)
            created = NOW - timedelta(days=R.betavariate(1.3, 2.4) * 180)
            status = R.choices(["redeemed", "issued", "expired"], [55, 30, 15])[0]
            dealer = R.choice([dl for dl in dealers if dl.district_id == m.district_id])
            s.add(Referral(code=code, mechanic_id=m.id, dealer_id=dealer.id,
                           tyre_model=R.choice(TYRE_MODELS), status=status, created_at=created,
                           redeemed_at=created + timedelta(hours=R.randint(2, 96)) if status == "redeemed" else None))
        s.commit()

        mods = []
        for slug, title, mins, pts, badge, summ in MODULES:
            mod = Module(slug=slug, title=title, minutes=mins, points=pts, badge=badge, summary=summ)
            s.add(mod)
            mods.append(mod)
        s.commit()
        for m in mechanics:
            for mod in mods:
                if R.random() < (0.35 if m.lifetime_points > 1500 else 0.08) or (m is hero and mod.slug != "monsoon-grip"):
                    s.add(Certification(mechanic_id=m.id, module_id=mod.id, score=R.randint(70, 100),
                                        verify_code=_code().replace("GG", "GC"),
                                        issued_at=NOW - timedelta(days=R.randint(1, 120))))
        s.commit()

        kinds = [("duplicate_serial", "Serial {s} scanned twice within 6 min", "high"),
                 ("velocity", "{n} scans in 10 min — above shop capacity", "medium"),
                 ("geo_mismatch", "Scan {k} km away from registered shop", "medium")]
        for _ in range(14):
            m = R.choice(mechanics)
            kind, tmpl, sev = R.choice(kinds)
            s.add(FraudAlert(mechanic_id=m.id, kind=kind,
                             detail=tmpl.format(s=_serial(), n=R.randint(9, 22), k=R.randint(18, 140)),
                             severity=sev, created_at=NOW - timedelta(hours=R.randint(1, 240)),
                             resolved=R.random() < 0.4))
        for _ in range(60):
            m = R.choice(mechanics)
            dist = round(R.uniform(0.3, 4.5), 1)
            s.add(SOSRequest(lat=m.lat + R.uniform(-0.03, 0.03), lng=m.lng + R.uniform(-0.03, 0.03),
                             mechanic_id=m.id, distance_km=dist, eta_min=int(dist * 4 + 3),
                             status=R.choice(["fixed", "fixed", "routed"]),
                             created_at=NOW - timedelta(hours=R.randint(1, 720))))
        s.commit()


if __name__ == "__main__":
    seed(force=True)
    print("Seeded Grip Guild demo data.")
