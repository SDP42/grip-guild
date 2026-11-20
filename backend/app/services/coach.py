"""Guild Coach — a personal, data-driven daily plan for each mechanic.

Rules are explicit and explainable: each card cites the number that triggered it
and links to the screen that resolves it.
"""


def plan(*, name: str, tier: str, next_tier: dict | None, lifetime: int, lease: dict | None,
         boomerang_due: int, open_sos: int, open_codes: int, quests: list[dict], stocks: bool,
         streak: int, certs: int, rating: float, unread: int) -> list[dict]:
    cards = []

    if open_sos:
        cards.append({"priority": 100, "kind": "sos", "title": f"{open_sos} rider{'s' if open_sos > 1 else ''} stranded near you",
                      "body": "Accept the Puncture SOS lead before another Guild shop does.", "cta": "Open leads", "href": "/app/inbox"})
    if boomerang_due:
        cards.append({"priority": 90, "kind": "boomerang", "title": f"{boomerang_due} past customers are due a tyre check",
                      "body": "Send them a reminder now. They come back to you, not to a rival shop.",
                      "cta": "Send reminders", "href": "/app/inbox"})
    claimable = [q for q in quests if q["done"] and not q.get("claimed")]
    if claimable:
        cards.append({"priority": 85, "kind": "quest", "title": f"Quest complete: {claimable[0]['title']}",
                      "body": f"Claim your reward: {claimable[0]['reward']}.", "cta": "Claim", "href": "/app/quests"})
    if lease and lease["pct"] < 100:
        left = max(1, (lease["total"] - lease["paid"]) // 30)
        cards.append({"priority": 70, "kind": "tool", "title": f"{left} fitments until you own the {lease['name']}",
                      "body": f"It's {lease['pct']}% paid. Each verified fitment pays about 30 points.", "cta": "Scan a fitment", "href": "/app/scan"})
    if next_tier:
        gap = next_tier["min"] - lifetime
        cards.append({"priority": 60 if gap < 1500 else 40, "kind": "tier",
                      "title": f"{gap:,} pts to {next_tier['name']}",
                      "body": f"Unlocks: {', '.join(next_tier['perks'][:2])}.", "cta": "See perks", "href": "/app/tools"})
    if not stocks:
        cards.append({"priority": 55, "kind": "shelf", "title": "No Eurogrip on your shelf? Sell it anyway",
                      "body": "Order through Ghost Shelf. The dealer delivers in hours and you earn 60 pts per fitment.",
                      "cta": "Open Ghost Shelf", "href": "/app/shelf"})
    if open_codes >= 2:
        cards.append({"priority": 50, "kind": "referral", "title": f"{open_codes} referral codes still open",
                      "body": "Nudge those riders. Each redeemed code is worth 80 pts.", "cta": "View referrals", "href": "/app/refer"})
    if certs < 3:
        cards.append({"priority": 45, "kind": "academy", "title": "Earn a badge in 10 minutes",
                      "body": "Certified shops rank higher in Puncture SOS and on the Living Shop Board.",
                      "cta": "Open Academy", "href": "/app/academy"})
    if streak == 0:
        cards.append({"priority": 65, "kind": "streak", "title": "Start your weekly streak",
                      "body": "One verified fitment this week starts it. Streaks feed your Guild Score.",
                      "cta": "Scan now", "href": "/app/scan"})
    if rating < 4.4:
        cards.append({"priority": 35, "kind": "rating", "title": f"Your rider rating is {rating}",
                      "body": "Share a TreadLens card after every job. Riders who get one rate higher.",
                      "cta": "Open TreadLens", "href": "/app/treadlens"})
    cards.sort(key=lambda c: -c["priority"])
    greeting = f"Good day, {name.split()[0]}. {len(cards)} things will grow your shop today."
    return [{"greeting": greeting, "unread": unread}, *cards[:6]]
