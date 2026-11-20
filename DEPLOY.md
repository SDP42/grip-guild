# Deploying Grip Guild (free tier)

Backend (FastAPI) → **Render** free web service.
Frontend (Next.js) → **Vercel** Hobby (free).

Total time: about 15 minutes. You need a GitHub account with access to `SDP42/grip-guild`.

---

## Part 1 — Backend on Render

### 1. Create the service from the Blueprint
1. Go to <https://dashboard.render.com> and sign in with **GitHub**.
2. Click **New +** → **Blueprint**.
3. Connect the repository **SDP42/grip-guild** (grant Render access to it if asked).
4. Render reads `render.yaml` from the repo root and shows one service: **grip-guild-api** (plan: Free).
5. Click **Apply** / **Deploy Blueprint**.

<details>
<summary>Prefer to set it up by hand instead of the Blueprint?</summary>

**New +** → **Web Service** → pick the repo, then:

| Field | Value |
|---|---|
| Name | `grip-guild-api` |
| Region | Singapore (closest to India) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | **Free** |
| Health Check Path | `/api/health` |
| Environment variables | `PYTHON_VERSION` = `3.12.8`, `ALLOWED_ORIGINS` = `*` |
</details>

### 2. Wait for the first deploy
- The build takes 2–4 minutes. The log should end with `Application startup complete`.
- Copy the service URL, e.g. `https://grip-guild-api.onrender.com`.

### 3. Check it works
Open these in a browser:
- `https://<your-render-url>/api/health` → `{"status":"ok","service":"grip-guild"}`
- `https://<your-render-url>/docs` → interactive API documentation
- `https://<your-render-url>/api/personas` → list of 8 personas

---

## Part 2 — Frontend on Vercel

### 1. Import the project
1. Go to <https://vercel.com/new> and sign in with **GitHub**.
2. **Import** the repository **SDP42/grip-guild**.
3. **Root Directory** → click *Edit* → choose **`frontend`**. Vercel detects **Next.js** automatically.
4. Leave Build Command (`next build`) and Output Directory as defaults.

### 2. Add the environment variable
Under **Environment Variables** add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | your Render URL, e.g. `https://grip-guild-api.onrender.com` (no trailing slash) |

### 3. Deploy
- Click **Deploy** (about 2 minutes).
- You get a URL like `https://grip-guild.vercel.app`. Rename the project under **Settings → General** for a nicer subdomain (e.g. `gripguild-outliers.vercel.app`).

> `NEXT_PUBLIC_*` variables are baked in at build time. If you change the Render URL later, **redeploy** the Vercel project.

---

## Part 3 — Lock CORS to your site (recommended)

1. Render → **grip-guild-api** → **Environment**.
2. Set `ALLOWED_ORIGINS` to your Vercel URL, e.g. `https://gripguild-outliers.vercel.app` (comma-separate several; include `http://localhost:3000` if you still develop locally).
3. Save. Render redeploys automatically.

---

## Part 4 — Before a demo or a judge visit

The Render free tier **sleeps after 15 minutes without traffic** and takes up to a minute to wake. The site handles this: it shows a "Waking up the Guild server…" banner and retries automatically. Still:

- **Open the site 2 minutes before presenting** (or open `/api/health`) to wake the backend.
- Optional: keep it awake during the judging window with a free uptime monitor (e.g. UptimeRobot) pinging `https://<render-url>/api/health` every 10 minutes. This uses free instance hours (750/month is enough for one always-on service).
- The free tier's disk is **ephemeral**: every restart re-seeds the demo database to a clean state. That is intended — judges always see a complete demo — but live actions (scans, SOS, ratings) reset after a restart.

---

## Part 5 — Smoke test after deploy (2 minutes)

1. `/` — 3D tyre hero loads; scroll the full page.
2. `/personas` → **Play as Ravi** → home shows Guild Coach and points.
3. **Scan** → *Simulate a QR scan* → points and tool EMI move.
4. New tab: `/rider` → **I have a flat tyre** → **Send SOS to Ravi**.
5. Back in Ravi's app → bell → **Inbox** → **Accept** → the rider tab shows the ETA.
6. `/dealer` → redeem a code → Ravi gets a notification.
7. `/command` and `/simulator` load charts.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Render build fails on Python version | Make sure `PYTHON_VERSION=3.12.8` is set (Blueprint does this) |
| Frontend shows "Backend offline" for > 1 min | Check `NEXT_PUBLIC_API_URL` on Vercel is the exact Render URL with `https://` and no trailing `/`, then redeploy |
| Browser console shows a CORS error | `ALLOWED_ORIGINS` on Render must include the exact Vercel URL (no trailing `/`) |
| Data disappeared | The free instance restarted; demo data re-seeds automatically |
| Vercel build fails | Confirm **Root Directory = `frontend`** |

## Upgrading later
- Persistent data: create a Render PostgreSQL database and point SQLModel at it (free Postgres expires after 30 days; use a paid instance for production).
- Always-on: Render Starter plan removes sleeping.
