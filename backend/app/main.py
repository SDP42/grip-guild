from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import advocacy, analytics, ecosystem, engage, mechanics, personas
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
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

for r in (personas.router, mechanics.router, advocacy.router, analytics.router, engage.router, ecosystem.router):
    app.include_router(r)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "grip-guild"}
