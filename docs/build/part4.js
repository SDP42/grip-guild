const fs = require("fs");
const path = require("path");
const L = require("./lib");
const { C, P, H1, H2, image, table, callout, tiles, spacer, sideBySide } = L;

function dayInGuild() {
  return [
    H1("19. A day in the Guild"),
    P("Features matter only if they fit a real working day. These two narratives follow the prototype's personas through flows that already work end-to-end in the code."),
    H2("19.1 Ravi, puncture shop, Pune (does not stock Eurogrip)"),
    table([
      ["Time", "What happens", "Feature · system effect"],
      ["8:30", "Ravi opens WhatsApp. Guild Coach: \"9 fitments until you own the pneumatic changer. 4 past customers are due a tyre check.\"", "Guild Coach reads his EMI, Boomerang list and quests"],
      ["9:10", "He taps Remind on four riders. Each gets a personal WhatsApp message with their tyre ID.", "Customer Boomerang · reminder logged, visible in the rider's feed"],
      ["11:45", "A rider wants a Protorq Extreme. Ravi has none in stock and orders it on Ghost Shelf.", "Ghost Shelf · order lands in the nearest dealer's queue"],
      ["12:20", "Bell rings: Puncture SOS, Priya, 0.5 km away. He accepts; she sees his ETA instantly.", "Puncture SOS · live state shared with the rider"],
      ["12:40", "Job done: +40 pts. Priya rates him five stars on his Living Shop Board.", "Rating feeds Guild Score; mechanic notified"],
      ["14:30", "Dealer dispatches and delivers the Ghost Shelf tyre. Ravi fits it and scans the QR: +60 pts, 30 to his EMI.", "Fraud Guard verifies the serial; Tyre Twin created"],
      ["16:00", "A rider who can't wait for stock gets a referral code to the dealer. Later: \"Referral redeemed, +80 pts.\"", "Influence without inventory · Influence Graph updated"],
      ["18:30", "TreadLens check on a worn tyre; health card sent to the rider with Ravi's shop name.", "Card saved to the Tyre Twin; Monsoon quest progress +1"],
    ], [9, 55, 36]),
    spacer(),
    H2("19.2 Priya, delivery rider, Pune"),
    table([
      ["Moment", "Before Grip Guild", "With Grip Guild"],
      ["Flat tyre mid-shift", "Walks the scooter, asks around, loses an hour of earnings", "SOS radar shows 3 Guild shops; Pit Pass priority; ETA in 4 minutes"],
      ["Choosing a shop", "No way to know who is good", "Living Shop Board: tier, rating, badges, verified rescues"],
      ["Buying a tyre", "Takes whatever is in stock", "Health card explains why; Eurogrip recommended with km-left estimate"],
      ["Is it genuine?", "No idea", "Scan the tyre QR: Tyre Twin confirms fitment, warranty and wear history"],
      ["Months later", "Forgets the tyre until it fails", "Boomerang reminder brings her back to the same mechanic"],
    ], [20, 38, 42], { firstBold: true }),
  ];
}

function pilot() {
  return [
    H1("20. Pilot experiment design"),
    P("The pilot is run as a controlled experiment so Eurogrip can decide on national roll-out from evidence, not anecdotes."),
    table([
      ["Design element", "Choice", "Reason"],
      ["Unit of randomisation", "District (pairs matched by region, urbanisation and baseline share)", "Avoids spill-over between neighbouring shops inside a city"],
      ["Size", "10 pilot + 10 control districts (~11,000 reachable shops each arm)", "Large enough to detect a 1.5 pp share shift; small enough to manage"],
      ["Duration", "16 weeks of treatment after a 4-week baseline", "Covers enrolment, habit formation and one quest cycle"],
      ["Primary metric", "Eurogrip share of 2W replacement sales (dealer secondary data + panel)", "What the business ultimately needs"],
      ["Secondary metrics", "Active shops, referral redemption, Ghost Shelf orders, recommendation rate (mystery-rider audit), fraud rate", "Explain how the lift happened"],
      ["Analysis", "Difference-in-differences with district fixed effects; weekly monitoring in the Command Centre", "Removes seasonality and market-wide trends"],
      ["Decision rule", "Scale if lift ≥ +1.5 pp, fraud < 2%, cost per incremental tyre ≤ ₹350", "Pre-agreed thresholds avoid moving goalposts"],
      ["Guardrails", "Points budget capped per district; weekly fraud review; dealer SLA tracking", "Protects budget and trust"],
    ], [22, 44, 34], { firstBold: true }),
    spacer(),
    callout("Mystery-rider audit: measuring the recommendation itself", [
      "Each month trained auditors visit a random sample of pilot and control shops, ask \"which tyre should I buy?\" and record the brand recommended.",
      "This captures **advocacy directly**, including at shops that never scan a Eurogrip QR, and complements the sales-based Lift Engine.",
    ]),
  ];
}

function economy() {
  return [
    H1("21. Points economy and liability control"),
    P("Points are a liability on Eurogrip's books until redeemed. The economy is designed so that liability is always bounded, predictable and backed by productive assets."),
    table([
      ["Control", "Mechanism"],
      ["Earn caps", "Maximum points per shop per week scaled to tier; velocity rule blocks bursts beyond shop capacity"],
      ["Burn into assets", "Points redeem only for tools, visibility, Academy and quest rewards bought at bulk prices, never for cash"],
      ["EMI routing", "50% of fitment points go to an active lease, so liability converts into a tool the shop then owns"],
      ["Expiry", "Unused wallet points expire after 12 months of inactivity; tier upkeep is quarterly"],
      ["District budgets", "Budget Autopilot allocates monthly points pools; overspend in one district cannot drain another"],
      ["Audit trail", "Every point traces to a verified event (scan, redemption, rescue, quiz) with a timestamp and location"],
    ], [22, 78], { firstBold: true }),
    spacer(),
    table([
      ["Indicative value per action (₹ at bulk price)", "Stocked fitment", "Ghost Shelf fitment", "Referral redeemed", "SOS rescue", "Academy module"],
      ["Points", "50", "60", "80", "40", "100–250"],
      ["Approx. programme cost (₹)", "40", "48", "64", "32", "80–200"],
      ["Share of a ₹1,450 tyre", "2.8%", "3.3%", "4.4%", "n/a", "n/a"],
    ], [32, 14, 15, 14, 12, 13], { firstBold: true }),
    P("At these rates the reward per tyre is a small share of the selling price, while the shop's perceived value is far higher, because it arrives as tools, customers and status rather than a few rupees of cash.", { size: 18 }),
  ];
}

function scorecard() {
  return [
    H1("22. Evaluation-criteria scorecard"),
    P("How Grip Guild answers each judging criterion in the brief, with pointers to the evidence in this report and the prototype."),
    table([
      ["Criterion (brief)", "What judges look for", "Grip Guild evidence", "Where"],
      ["Incentive realism", "Would mechanics actually engage?", "Tools to own, more customers, visible status; WhatsApp-first; credit access. Every reward matches what mechanics say they want", "§6, §7, §19"],
      ["Insight-grounding", "Builds on the shift to tools and visibility, away from cash", "Insight-to-feature map; no cash anywhere in the core loop; non-stock advocacy rewarded most", "§4, Fig. 2"],
      ["Scalability", "Works nationally within budget", "Dealer-led onboarding, Circles, Nudge-focused field work; simulator sized to 600+ districts at ₹25 Cr", "§13, §14"],
      ["Sustainability", "Advocacy persists after the first incentive", "Tool EMI, tier upkeep, quests, streaks, Boomerang repeat customers, Guild Passport", "§15.2"],
      ["Measurability", "Feasible tracking, even if imperfect", "Verified events, Guild Score, Influence Graph, Fraud Guard, Lift Engine vs control, mystery-rider audit", "§12, §20"],
    ], [17, 22, 46, 15], { firstBold: true }),
    spacer(),
    tiles([["Realistic", "rewards mechanics want"], ["Grounded", "in all 5 insights"], ["Scalable", "WhatsApp + dealers"], ["Sustained", "assets that compound"], ["Measured", "lift vs control"]]),
  ];
}

module.exports = { dayInGuild, pilot, economy, scorecard };
