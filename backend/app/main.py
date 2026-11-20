import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import advocacy, analytics, ecosystem, engage, live, mechanics, personas
from .seed import seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed()
    yield


app = FastAPI(
    title="Grip Guild API",
    description="Tools, Customers and Status for India's two-wheeler mechanics — by Eurogrip.",
    version="0.1.0",
    lifespan=lifespan,
)
# Comma-separated list in production (e.g. your Vercel URL); "*" for local demos.
ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["*"], allow_headers=["*"])

for r in (personas.router, mechanics.router, advocacy.router, analytics.router, engage.router, ecosystem.router, live.router):
    app.include_router(r)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "grip-guild"}
