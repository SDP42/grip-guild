"""Tiny helper so every cross-persona action leaves a trace in the mechanic's inbox."""
from datetime import datetime

from sqlmodel import Session

from ..models import Notification


def notify(session: Session, mechanic_id: int, kind: str, title: str, body: str, link: str = "") -> None:
    session.add(Notification(mechanic_id=mechanic_id, kind=kind, title=title, body=body, link=link,
                             created_at=datetime.now()))
