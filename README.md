# Grip Guild

**Join the Guild. Grip the Road.**

Grip Guild turns India's two-wheeler mechanics and puncture shops into measurable advocates for Eurogrip tyres. It gives them the three things that grow their business — **tools, customers and status** — instead of cash.

Built for **Eurogrip TORQ Challenge 4.0 — Case Study 4** (mechanic & puncture-shop advocacy ecosystem) by **Team Outliers**: Swayam Panchal, Rishit Lahoti and Jeevesh Bodhani, Department of Artificial Intelligence and Data Science, Dwarkadas J. Sanghvi College of Engineering.

---

## The brief, decoded

| Insight from Eurogrip's mechanic brand-track | What Grip Guild does |
|---|---|
| Awareness is lukewarm; recommendation lags | Every feature converts a known brand into a *recommended* one |
| Stocking lags competitors | **Ghost Shelf** — sell Eurogrip with zero inventory; the dealer delivers in hours |
| Tools & equipment now beat cash | **Fitments Pay Off Your Tools** — half of every fitment's points pay an EMI on a machine the mechanic will own |
| Brand visibility is rising fast | Four-step **Guild ladder** + **Living Shop Board** riders can scan to verify |
| Non-stockers already advocate | **Referral codes** credit influence itself, stock or not |

## Features

**Tools** — Tool Store with lease-to-own · Circle Tool Pools · starter kit on joining
**Customers** — Puncture SOS · Customer Boomerang reminders · Ghost Shelf · Fleet Pit Pass for gig-delivery fleets
**Status** — Apprentice → Craftsman → Master → Grandmaster · Living Shop Board · Guild Academy badges · Guild Passport (credit & insurance)
**Digital twin** — every fitted tyre gets a **Tyre Twin**: 3D wear heatmap, exploded layer view, wear history, warranty and a genuine-tyre check
**Measurement** — Guild Score · Lift Engine (difference-in-differences vs control districts) · Influence Graph · Fraud Guard · Nudge Engine (churn risk) · Budget Autopilot · national rollout simulator
**Reach** — WhatsApp-first Guild Bot, no app install needed

## Personas (play the program from every seat)

| Persona | Route |
|---|---|
| Ravi — puncture shop, doesn't stock Eurogrip | `/app?persona=ravi` |
| Gurpreet — Grandmaster garage, Circle mentor | `/app?persona=gurpreet` |
| Imran — new Apprentice, day 6 | `/app?persona=imran` |
| Lakshmi — EV scooter specialist | `/app?persona=lakshmi` |
| Priya — gig delivery rider | `/rider` |
| Dealer | `/dealer` |
| Anita — field officer | `/field` |
| Brand manager | `/command`, `/simulator` |

## Stack

- **Backend:** Python, FastAPI, SQLModel, SQLite (auto-seeded demo data across 30 districts)
- **Frontend:** Next.js 15, TypeScript, Tailwind, React Three Fiber, GSAP ScrollTrigger, Lenis, Framer Motion, Recharts

## Run locally

```bash
# Backend (http://localhost:8000, docs at /docs)
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000

# Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` if the API runs elsewhere. Run backend tests with `.venv/bin/pip install -r requirements-dev.txt && .venv/bin/pytest`.

### Optional: cinematic scroll film

Turn a licensed clip into a scroll-scrubbed frame sequence (the landing page picks it up automatically):

```bash
scripts/extract_frames.sh path/to/clip.mp4 workshop
```

---

All numbers in the prototype are simulated planning estimates, not Eurogrip data.
