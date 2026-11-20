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
    FieldVisit,
    FleetAccount,
    GhostOrder,
    RiderRating,
    TreadCheck,
    Fitment,
    FraudAlert,
    Mechanic,
    Module,
    Notification,
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


PERSONA_MECHANICS = [
    dict(slug="ravi", name="Ravi Kumar", shop="Sai Puncture Works", district="Pune", type="puncture",
         stocks=False, lifetime=7420, points=3840, streak=11, rating=4.8, ratings=164, days=142,
         leases=[(11, 0.70)]),
    dict(slug="gurpreet", name="Gurpreet Singh", shop="Royal Two Wheeler Clinic", district="Ludhiana",
         type="multi-brand", stocks=True, lifetime=15800, points=6200, streak=24, rating=4.9, ratings=231,
         days=196, leases=[(10, 1.0), (12, 0.48)]),
    dict(slug="imran", name="Imran Shaikh", shop="New Star Puncture Point", district="Lucknow", type="puncture",
         stocks=False, lifetime=220, points=220, streak=1, rating=4.3, ratings=6, days=6, leases=[]),
    dict(slug="lakshmi", name="Lakshmi Reddy", shop="Volt Bike Care", district="Chennai", type="garage",
         stocks=True, lifetime=3100, points=1450, streak=9, rating=4.9, ratings=88, days=110,
         leases=[(7, 0.42)]),
]
PERSONA_CERTS = {
    "ravi": ["tubeless-101", "ev-tyres", "treadlens", "safe-fit", "talk-to-riders"],
    "gurpreet": ["tubeless-101", "treadlens", "safe-fit", "talk-to-riders", "monsoon-grip"],
    "imran": [],
    "lakshmi": ["ev-tyres", "treadlens", "safe-fit"],
}


def _serial() -> str:
    return "EG" + "".join(R.choice("0123456789ABCDEF") for _ in range(10))


def _code() -> str:
    return "GG-" + "".join(R.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5))


def _mask() -> str:
    return f"+91 9{R.randint(1000, 9999)}X XX{R.randint(10, 99)}"


def seed(force: bool = False) -> None:
    from .db import DB_PATH, SCHEMA_VERSION, init_db

    marker = DB_PATH.with_suffix(".schema")
    if not marker.exists() or marker.read_text() != SCHEMA_VERSION:
        force = True  # schema changed since the DB was created → rebuild demo data
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
            lifetime = int(R.paretovariate(1.3) * 1300) if pilot else R.randint(0, 400)
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
        # Demo personas — real-feeling mechanics the visitor can "become".
        persona_rows = {}
        for spec in PERSONA_MECHANICS:
            d = next(x for x in districts if x.name == spec["district"])
            circle = next((c for c in circles if c.district_id == d.id), None)
            pm = Mechanic(name=spec["name"], shop_name=spec["shop"], district_id=d.id,
                          circle_id=circle.id if circle else None, lat=d.lat + 0.004, lng=d.lng - 0.006,
                          language="English", phone_masked=_mask(), shop_type=spec["type"],
                          stocks_eurogrip=spec["stocks"], tier=tier_for(spec["lifetime"]), points=spec["points"],
                          lifetime_points=spec["lifetime"], streak_weeks=spec["streak"], rating=spec["rating"],
                          ratings_count=spec["ratings"], joined_at=NOW - timedelta(days=spec["days"]),
                          avatar_seed=1, persona=spec["slug"])
            s.add(pm)
            persona_rows[spec["slug"]] = (pm, spec)
        s.commit()
        mechanics.extend(pm for pm, _ in persona_rows.values())

        tools = []
        for name, cat, mrp, tier, icon, blurb in TOOLS:
            pts = int(mrp * 0.8)  # bulk procurement ≈ 20% below MRP
            t = Tool(name=name, category=cat, mrp_inr=mrp, points_cost=pts,
                     weekly_lease_points=max(25, pts // 26), tier_required=tier, icon=icon, blurb=blurb)
            s.add(t)
            tools.append(t)
        s.commit()

        randoms = [m for m in mechanics if not m.persona]
        for m in R.sample(randoms, 90):
            t = R.choice(tools[5:])
            paid = t.points_cost if R.random() < 0.25 else R.randint(int(t.points_cost * 0.1), t.points_cost - 1)
            s.add(ToolLease(mechanic_id=m.id, tool_id=t.id, points_paid=paid, points_total=t.points_cost,
                            started_at=NOW - timedelta(days=R.randint(5, 150)),
                            status="owned" if paid >= t.points_cost else "active"))
        for pm, spec in persona_rows.values():
            for tool_idx, pct in spec["leases"]:
                t = tools[tool_idx]
                paid = int(t.points_cost * pct)
                s.add(ToolLease(mechanic_id=pm.id, tool_id=t.id, points_paid=paid, points_total=t.points_cost,
                                started_at=NOW - timedelta(days=60), status="owned" if pct >= 1 else "active"))
        s.commit()

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
                          reminder_due_at=created + timedelta(days=R.randint(150, 420))))
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
                if (mod.slug in PERSONA_CERTS.get(m.persona, [])) if m.persona else R.random() < (0.35 if m.lifetime_points > 1500 else 0.08):
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

        # Ghost Shelf orders, Tyre Twin checks, fleets, ratings, field visits
        non_stock = [m for m in mechanics if not m.stocks_eurogrip]
        for _ in range(140):
            m = R.choice(non_stock)
            dl = R.choice([x for x in dealers if x.district_id == m.district_id])
            s.add(GhostOrder(mechanic_id=m.id, dealer_id=dl.id, tyre_model=R.choice(TYRE_MODELS),
                             size=R.choice(["90/90-17", "90/100-10", "80/100-18", "100/80-17"]),
                             status=R.choices(["fitted", "delivered", "dispatched", "placed"], [60, 15, 15, 10])[0],
                             created_at=NOW - timedelta(hours=R.randint(1, 900)), eta_hours=dl.ghost_shelf_sla_hours))
        fits = s.exec(select(Fitment)).all()
        for f in R.sample([x for x in fits if (NOW - x.created_at).days > 45], 500):
            depth = R.uniform(4.5, 6.0)
            for k in range(R.randint(1, 4)):
                if f.created_at + timedelta(days=30 * (k + 1)) > NOW:
                    break
                depth -= R.uniform(0.4, 1.1)
                s.add(TreadCheck(serial=f.serial, mechanic_id=f.mechanic_id, tread_mm=round(max(1.0, depth), 1),
                                 psi=R.randint(22, 32), score=R.randint(30, 95),
                                 created_at=f.created_at + timedelta(days=30 * (k + 1))))
        for name, city, riders, plan in [("SwiftDrop Logistics", "Pune", 820, "Pro"), ("CityBite Riders", "Bengaluru", 1450, "Pro"),
                                         ("QuickKart Fleet", "Chennai", 610, "Basic"), ("ParcelPro", "Lucknow", 380, "Basic"),
                                         ("MetroMeals Delivery", "Hyderabad", 990, "Pro")]:
            s.add(FleetAccount(name=name, city=city, riders=riders, plan=plan,
                               monthly_fee_inr=riders * (39 if plan == "Pro" else 19),
                               jobs_30d=int(riders * R.uniform(0.18, 0.35)), avg_downtime_min=R.randint(22, 41)))
        comments = ["Fixed my tubeless in 10 minutes", "Honest advice, didn't oversell", "Great tyre check card",
                    "Open late, saved my delivery shift", "Explained wear pattern clearly", "Fair price, fast work"]
        for m in R.sample(mechanics, 200):
            s.add(RiderRating(mechanic_id=m.id, stars=R.choices([5, 4, 3], [6, 3, 1])[0], comment=R.choice(comments),
                              created_at=NOW - timedelta(hours=R.randint(1, 700))))
        officers = ["Anita Desai", "Vikram Rao", "Sameer Khan"]
        for m in R.sample(mechanics, 60):
            s.add(FieldVisit(mechanic_id=m.id, officer=R.choice(officers),
                             purpose=R.choice(["onboard", "nudge", "kit_delivery", "board_install", "audit"]),
                             status=R.choice(["planned", "done"]),
                             scheduled_for=NOW + timedelta(hours=R.randint(-72, 72))))
        s.commit()

        # Name riders on fitments and seed a welcome inbox for each persona
        riders = ["Priya", "Arjun", "Neha", "Rohit", "Fatima", "Karan", "Sneha", "Vikas", "Divya", "Amit", "Pooja", "Rahul"]
        for f in s.exec(select(Fitment)).all():
            f.rider_name = R.choice(riders)
            s.add(f)
        for pm, spec in persona_rows.values():
            s.add(Notification(mechanic_id=pm.id, kind="system", title="Welcome to Grip Guild",
                               body="Your Guild Coach has today's plan ready.", link="/app", created_at=NOW - timedelta(hours=3)))
        s.commit()
    marker.write_text(SCHEMA_VERSION)


if __name__ == "__main__":
    seed(force=True)
    print("Seeded Grip Guild demo data.")
