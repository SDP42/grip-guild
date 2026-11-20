"""Grip Guild data model.

Core idea: mechanics earn *Tools, Customers and Status* — not cash.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class District(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    state: str
    lat: float
    lng: float
    region: str  # North / South / East / West / Central
    cohort: str  # "pilot" or "control" — used by the Lift Engine
    baseline_share: float  # Eurogrip replacement share before launch (%)
    current_share: float  # share now (%)


class Dealer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    district_id: int = Field(foreign_key="district.id")
    lat: float
    lng: float
    ghost_shelf_sla_hours: int = 4  # how fast the dealer delivers to a non-stocking shop


class Circle(SQLModel, table=True):
    """Guild Circle: a pod of 8–10 nearby mechanics with a Grandmaster mentor."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    district_id: int = Field(foreign_key="district.id")
    goal_fitments: int
    progress_fitments: int
    unlock_reward: str


class Mechanic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    shop_name: str
    district_id: int = Field(foreign_key="district.id")
    circle_id: Optional[int] = Field(default=None, foreign_key="circle.id")
    lat: float
    lng: float
    language: str
    phone_masked: str
    shop_type: str  # "puncture" | "garage" | "multi-brand"
    stocks_eurogrip: bool
    tier: str  # Apprentice | Craftsman | Master | Grandmaster
    points: int
    lifetime_points: int
    streak_weeks: int
    rating: float  # rider rating from the Living Shop Board
    ratings_count: int
    joined_at: datetime
    avatar_seed: int
    persona: Optional[str] = Field(default=None, index=True)  # demo persona slug


class Tool(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str  # changer | power | tubeless | diagnostic | safety | visibility
    mrp_inr: int
    points_cost: int
    weekly_lease_points: int  # "Fitments Pay Off Your Tools" EMI in points
    tier_required: str
    icon: str
    blurb: str


class ToolLease(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    tool_id: int = Field(foreign_key="tool.id")
    points_paid: int
    points_total: int
    started_at: datetime
    status: str = "active"  # active | owned


class Fitment(SQLModel, table=True):
    """A verified Eurogrip tyre fitment (QR on the tyre / warranty card)."""

    id: Optional[int] = Field(default=None, primary_key=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    serial: str = Field(index=True, unique=True)
    tyre_model: str
    vehicle: str
    rider_phone_masked: str
    points: int
    channel: str  # "stock" | "ghost_shelf" | "referral"
    created_at: datetime
    reminder_due_at: datetime  # Customer Boomerang


class Referral(SQLModel, table=True):
    """Advocacy without inventory: a code the rider redeems at a dealer."""

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    dealer_id: int = Field(foreign_key="dealer.id")
    tyre_model: str
    status: str  # issued | redeemed | expired
    created_at: datetime
    redeemed_at: Optional[datetime] = None


class Module(SQLModel, table=True):
    """Guild Academy module (certification)."""

    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str
    title: str
    minutes: int
    points: int
    badge: str
    summary: str


class Certification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    module_id: int = Field(foreign_key="module.id")
    score: int
    verify_code: str
    issued_at: datetime


class FraudAlert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    kind: str  # duplicate_serial | velocity | geo_mismatch
    detail: str
    severity: str  # low | medium | high
    created_at: datetime
    resolved: bool = False


class SOSRequest(SQLModel, table=True):
    """Puncture SOS: a stranded rider routed to the nearest Guild shop."""

    id: Optional[int] = Field(default=None, primary_key=True)
    lat: float
    lng: float
    mechanic_id: int = Field(foreign_key="mechanic.id")
    distance_km: float
    eta_min: int
    status: str  # routed | fixed
    created_at: datetime


class GhostOrder(SQLModel, table=True):
    """Ghost Shelf order: a non-stocking shop orders a tyre, the dealer delivers it."""

    id: Optional[int] = Field(default=None, primary_key=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    dealer_id: int = Field(foreign_key="dealer.id")
    tyre_model: str
    size: str
    status: str  # placed | dispatched | delivered | fitted
    created_at: datetime
    eta_hours: int


class TreadCheck(SQLModel, table=True):
    """Tyre Twin history: every TreadLens check on a registered tyre."""

    id: Optional[int] = Field(default=None, primary_key=True)
    serial: str = Field(index=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    tread_mm: float
    psi: float
    score: int
    created_at: datetime


class FleetAccount(SQLModel, table=True):
    """Fleet Pit Pass: a gig/delivery fleet buys priority tyre care at Guild shops."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    city: str
    riders: int
    plan: str  # Basic | Pro
    monthly_fee_inr: int
    jobs_30d: int
    avg_downtime_min: int


class RiderRating(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    stars: int
    comment: str
    created_at: datetime


class FieldVisit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mechanic_id: int = Field(foreign_key="mechanic.id")
    officer: str
    purpose: str  # onboard | nudge | kit_delivery | board_install | audit
    status: str  # planned | done
    scheduled_for: datetime
    notes: str = ""
