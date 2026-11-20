"""Fraud Guard — checks every scan before points are credited."""
from datetime import datetime, timedelta
from math import asin, cos, radians, sin, sqrt

VELOCITY_WINDOW_MIN = 10
VELOCITY_MAX = 8
GEO_MAX_KM = 15


def haversine_km(lat1, lng1, lat2, lng2) -> float:
    dlat, dlng = radians(lat2 - lat1), radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def check_scan(*, serial_exists: bool, recent_scan_times: list[datetime], now: datetime,
               shop_lat: float, shop_lng: float, scan_lat: float | None, scan_lng: float | None) -> list[dict]:
    flags = []
    if serial_exists:
        flags.append({"kind": "duplicate_serial", "severity": "high",
                      "detail": "This tyre serial was already registered."})
    window = [t for t in recent_scan_times if now - t < timedelta(minutes=VELOCITY_WINDOW_MIN)]
    if len(window) >= VELOCITY_MAX:
        flags.append({"kind": "velocity", "severity": "medium",
                      "detail": f"{len(window) + 1} scans in {VELOCITY_WINDOW_MIN} min — above shop capacity."})
    if scan_lat is not None and scan_lng is not None:
        km = haversine_km(shop_lat, shop_lng, scan_lat, scan_lng)
        if km > GEO_MAX_KM:
            flags.append({"kind": "geo_mismatch", "severity": "medium",
                          "detail": f"Scan {km:.0f} km away from the registered shop."})
    return flags
