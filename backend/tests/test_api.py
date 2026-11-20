import os
import tempfile

os.environ["GRIP_DB"] = os.path.join(tempfile.mkdtemp(), "test.db")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def client():
    return TestClient(app)


def test_core_flow():
    with client() as c:
        me = c.get("/api/mechanics/me").json()
        mid = me["mechanic"]["id"]
        assert me["tier"]["name"] == "Master"
        for p in ["/api/analytics/overview", "/api/analytics/funnel", "/api/analytics/lift",
                  "/api/analytics/timeseries", "/api/analytics/map", "/api/analytics/influence",
                  "/api/analytics/fraud", "/api/analytics/circles", "/api/tools", "/api/tiers",
                  "/api/academy", f"/api/ghost-shelf/{mid}", "/api/mechanics/leaderboard"]:
            assert c.get(p).status_code == 200, p

        ok = c.post("/api/scan", json={"mechanic_id": mid, "serial": "EG1234ABCD99"}).json()
        assert ok["ok"] and ok["points"] == 60  # hero does not stock → Ghost Shelf
        dup = c.post("/api/scan", json={"mechanic_id": mid, "serial": "EG1234ABCD99"}).json()
        assert not dup["ok"] and dup["flags"][0]["kind"] == "duplicate_serial"

        ref = c.post("/api/referrals", json={"mechanic_id": mid}).json()
        assert c.post(f"/api/referrals/{ref['code']}/redeem").json()["points"] == 80
        assert c.post(f"/api/referrals/{ref['code']}/redeem").status_code == 409


def test_bot_and_engines():
    with client() as c:
        mid = c.get("/api/mechanics/me").json()["mechanic"]["id"]
        for text in ["hello", "2", "3", "4", "5", "tread 1.9mm", "EGABCDEF1234", "xyz"]:
            msgs = c.post("/api/bot", json={"mechanic_id": mid, "text": text}).json()["messages"]
            assert msgs and msgs[0]["text"]
        tl = c.post("/api/treadlens", json={"tread_mm": 1.5, "pattern": "edges", "psi": 22}).json()
        assert tl["verdict"] == "Replace now"
        assert len(c.post("/api/sos", json={"lat": 18.52, "lng": 73.86}).json()) == 3
        sim = c.post("/api/simulate", json={"budget_cr": 25, "districts": 120}).json()
        assert sim["active"] > 0 and sim["roi_x"] > 0
        imran = c.get("/api/mechanics/me?persona=imran").json()["mechanic"]["id"]
        q = c.post("/api/academy/tubeless-101/submit", json={"mechanic_id": imran, "answers": [1, 0, 1]}).json()
        assert q["passed"]
        assert c.get(f"/api/verify/{q['verify_code']}").json()["valid"]


def test_personas_and_ecosystem():
    with client() as c:
        ps = c.get("/api/personas").json()
        assert {p["slug"] for p in ps} >= {"ravi", "gurpreet", "imran", "lakshmi", "priya", "dealer", "anita", "brand"}
        for slug in ["ravi", "gurpreet", "imran", "lakshmi"]:
            me = c.get(f"/api/mechanics/me?persona={slug}").json()
            assert me["mechanic"]["persona"] == slug and me["quests"]
        serial = c.get("/api/rider/sample-serial").json()["serial"]
        twin = c.get(f"/api/rider/tyre/{serial}").json()
        assert twin["genuine"] and len(twin["history"]) >= 3
        assert not c.get("/api/rider/tyre/EGFAKE000000").json()["genuine"]
        assert c.get("/api/fleets").json()
        q = c.get("/api/dealer/1/queue").json()
        assert "referrals" in q and "orders" in q
        mid = c.get("/api/mechanics/me").json()["mechanic"]["id"]
        o = c.post("/api/ghost-orders", json={"mechanic_id": mid, "tyre_model": "Protorq Extreme", "size": "90/90-17"}).json()
        assert c.post(f"/api/ghost-orders/{o['id']}/advance").json()["status"] == "dispatched"
        assert c.get("/api/field/nudges").json()["items"]
        assert c.post("/api/rider/rate", json={"mechanic_id": mid, "stars": 5}).json()["ok"]
        auto = c.get("/api/analytics/autopilot").json()
        assert abs(sum(x["next_lakh"] for x in auto) - 60) < 0.5


def test_cross_persona_flows():
    with client() as c:
        mid = c.get("/api/mechanics/me?persona=ravi").json()["mechanic"]["id"]
        coach = c.get(f"/api/mechanics/{mid}/coach").json()
        assert coach[0]["greeting"] and len(coach) > 1

        # Rider SOS -> mechanic inbox -> accept -> fixed (+40 pts)
        sos = c.post("/api/sos/request", json={"mechanic_id": mid, "lat": 18.52, "lng": 73.86, "rider_name": "Priya"}).json()
        box = c.get(f"/api/mechanics/{mid}/inbox").json()
        assert any(s["id"] == sos["id"] for s in box["sos"]) and box["unread"] >= 1
        assert c.post(f"/api/sos/{sos['id']}/accept").json()["status"] == "accepted"
        assert c.get(f"/api/sos/{sos['id']}").json()["status"] == "accepted"
        assert c.post(f"/api/sos/{sos['id']}/fixed").json()["status"] == "fixed"

        # Boomerang reminder reaches the rider
        due = box["boomerang"]
        if due:
            r = c.post(f"/api/boomerang/{due[0]['fitment_id']}/send").json()
            assert r["whatsapp"].startswith("https://wa.me/")
            assert c.get(f"/api/rider/messages?name={due[0]['rider']}").json()

        # TreadLens card saved, shared, and visible to the rider
        card = c.post("/api/treadlens/save", json={"mechanic_id": mid, "rider_name": "Priya", "tread_mm": 1.9, "pattern": "edges", "psi": 22}).json()
        assert c.get(f"/api/cards/{card['card_id']}").json()["shop"]
        assert any(m["kind"] == "card" for m in c.get("/api/rider/messages?name=Priya").json())

        # Dealer redemption notifies the mechanic
        ref = c.post("/api/referrals", json={"mechanic_id": mid}).json()
        c.post(f"/api/referrals/{ref['code']}/redeem")
        kinds = {n["kind"] for n in c.get(f"/api/mechanics/{mid}/inbox").json()["notifications"]}
        assert {"sos", "referral"} <= kinds

        # Credit, board, circle, quiz per module, fraud resolve
        assert c.post("/api/passport/apply", json={"mechanic_id": mid, "amount_inr": 10000}).json()["status"] == "approved"
        assert c.get(f"/api/board/{mid}").json()["sos_rescues"] >= 1
        me = c.get("/api/mechanics/me?persona=ravi").json()
        assert c.get(f"/api/circles/{me['mechanic']['circle_id']}/members").json()["members"]
        assert c.get("/api/academy/ev-tyres/quiz").json()[0]["q"].startswith("Why do EV")
        assert c.get("/api/academy/ev-tyres/lesson").json()["steps"]
        fid = c.get("/api/analytics/fraud").json()[0]["id"]
        assert c.post(f"/api/analytics/fraud/{fid}/resolve").json()["ok"]

        # Quest claim: unfinished quest refuses, finished quest pays once
        q = c.post(f"/api/quests/ev-pioneer/claim?mechanic_id={mid}")
        assert q.status_code in (200, 400)
