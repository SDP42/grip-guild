"""Guild tiers — status that mechanics can see on their shop board."""

TIERS = [
    {
        "name": "Apprentice", "min": 0, "color": "#9CA3AF",
        "board": "Sticker decal + verify-QR",
        "perks": ["Tubeless kit on joining", "Guild Academy access", "Puncture SOS listing"],
    },
    {
        "name": "Craftsman", "min": 1500, "color": "#38BDF8",
        "board": "Metal Guild plate",
        "perks": ["Tool leases unlocked", "Uniform set", "Ghost Shelf ordering"],
    },
    {
        "name": "Master", "min": 5000, "color": "#F59E0B",
        "board": "LED Living Shop Board",
        "perks": ["Power tools & balancer", "Priority SOS leads", "Guild Passport credit line"],
    },
    {
        "name": "Grandmaster", "min": 12000, "color": "#E11D48",
        "board": "Full shop-front makeover",
        "perks": ["Pneumatic changer", "Circle mentor role", "Eurogrip plant visit"],
    },
]


def tier_for(lifetime_points: int) -> str:
    name = TIERS[0]["name"]
    for t in TIERS:
        if lifetime_points >= t["min"]:
            name = t["name"]
    return name


def next_tier(lifetime_points: int):
    for t in TIERS:
        if lifetime_points < t["min"]:
            return t
    return None


def tier_rank(name: str) -> int:
    return [t["name"] for t in TIERS].index(name)
