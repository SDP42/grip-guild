const fs = require("fs");
const path = require("path");
const L = require("./lib");
const { C, P, H1, H2, H3, bullet, image, table, callout, tiles, sideBySide, imagePair, spacer } = L;
const sim = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../assets/sim25.json"), "utf8"));

function solution() {
  return [
    H1("6. The solution: Grip Guild"),
    P("Grip Guild is a professional guild for India's two-wheeler mechanics, run by Eurogrip. Membership is free. Shops join through their dealer or a field officer, get a starter kit on day one, and from then on every Eurogrip-related action they take earns points and builds their standing."),
    ...image("screens/pillars.jpg", 680, "Figure 6. The three pillars as presented on the Grip Guild landing page."),
    H2("6.1 How points flow"),
    table([
      ["Verified action", "Points", "Where they go"],
      ["Stocked Eurogrip fitment (QR on tyre / warranty card)", "50", "Half to the active tool EMI, half to the wallet"],
      ["Ghost Shelf fitment (no stock held)", "60", "Same split. Rewards selling without inventory"],
      ["Referral redeemed at a dealer (no fitment by the shop)", "80", "Highest reward. Pure influence"],
      ["Puncture SOS rescue completed", "40", "Wallet; also raises rider rating and Guild Score"],
      ["Academy module passed", "100–250", "Wallet; badge appears on the Living Shop Board"],
      ["Seasonal quest completed", "300–500", "Wallet plus a non-cash reward (banner, double-EMI week)"],
    ], [52, 12, 36], { firstBold: false }),
    spacer(),
    callout("Why points never turn into cash", [
      "Points buy **tools, visibility and skills** at bulk-procurement prices (~20% below MRP), so each rupee of budget delivers more perceived value than a rupee of cash.",
      "Tools are **owned after the EMI is paid off**, so the mechanic has a strong reason to keep recommending Eurogrip for months, not days.",
      "Status is **visible and kept up through activity** (quarterly tier upkeep), so it cannot be bought once and forgotten.",
    ]),
    spacer(),
    ...image("tiers.png", 680, "Figure 7. The four-step Guild ladder and what each tier unlocks."),
    H2("6.2 The member journey"),
    table([
      ["Stage", "Mechanic experience", "System behaviour"],
      ["Day 0 · Join", "Dealer or field officer signs the shop up on WhatsApp; starter kit delivered", "Shop geo-tagged, assigned to a Guild Circle, Apprentice board issued"],
      ["Week 1 · First win", "Guild Coach suggests a first scan; first fitment earns points and starts a streak", "Fraud Guard verifies the serial; Tyre Twin created; rider registered for Boomerang"],
      ["Month 1–3 · Habit", "Referrals, Ghost Shelf orders, TreadLens cards, quests", "Guild Score computed weekly; Nudge Engine watches for drop-offs"],
      ["Month 3–6 · Tools", "Reaches Craftsman, leases a bead breaker or impact wrench", "Half of each fitment pays the EMI; ownership on completion"],
      ["Month 6+ · Status", "Master or Grandmaster board, mentor role, credit line", "Influence Graph flags top advocates for priority leads"],
    ], [18, 44, 38], { firstBold: true }),
  ];
}

const FEATURES = [
  ["Guild Bot on WhatsApp", "Zero-install channel", "Mechanics already live on WhatsApp. A menu-driven bot handles scans, points, referrals, tool EMI, Circle rank and TreadLens in plain English with numbered shortcuts.", "Rules-based intent engine (keywords, synonyms, menu numbers) writing to the same database as the app; production would sit behind the WhatsApp Business Cloud API.", "Scalability"],
  ["Fitments Pay Off Your Tools", "Tools pillar", "A mechanic leases a machine (tyre changer, wheel balancer, compressor) and half the points from every verified fitment repay it until it is owned.", "ToolLease table tracks paid vs total points; every scan, referral redemption or SOS rescue credits the EMI; ownership flips automatically.", "Insight 3 · Sustainability"],
  ["Ghost Shelf", "Customers pillar", "Non-stocking shops sell Eurogrip from a virtual shelf. The nearest dealer gets the order, delivers within the SLA and the shop earns on fitment.", "GhostOrder lifecycle (placed → dispatched → delivered → fitted) with live status in the mechanic app and a dealer queue.", "Insight 2 · Insight 5"],
  ["Referral codes", "Influence without inventory", "The mechanic sends a rider a code on WhatsApp; the dealer redeems it at sale; the mechanic earns 80 points even without stock.", "Codes are single-use and dealer-bound; redemption notifies the mechanic instantly and feeds the Influence Graph.", "Insight 5 · Measurability"],
  ["Puncture SOS", "Brand-sent leads", "A stranded rider taps SOS; the three nearest Guild shops appear on a radar map; the chosen shop accepts and the rider sees a live ETA.", "SOSRequest lifecycle (requested → accepted → fixed) with notifications both ways and +40 points on completion.", "Customers"],
  ["Customer Boomerang", "Repeat business", "Every registered tyre carries a reminder date. The mechanic's inbox lists riders due back and sends a WhatsApp reminder in one tap.", "Fitment.reminder_due_at / reminder_sent_at; reminders appear in the rider's message feed.", "Sustainability"],
  ["TreadLens", "Digital diagnostic tool", "A 20-second tread, pressure and wear-pattern check produces a rider-facing health card with the shop's name, sent on WhatsApp.", "Scoring engine (depth, pressure deviation, age, pattern, cracks); each card is saved to the tyre's Twin and counted toward quests.", "Insight 3 (functional support)"],
  ["Tyre Twin (3D)", "Eurogrip's blind spot, fixed", "Every fitted tyre gets a digital twin: 3D wear heatmap, exploded layer view, wear history, warranty date and a genuine-tyre check.", "React Three Fiber model with per-block heat colouring; TreadCheck history; unknown serials flagged as possible counterfeits.", "Rider trust · Data"],
  ["Living Shop Board", "Verified status", "Physical board with a QR. Riders scan it to see tier, rating, badges, verified fitments and SOS rescues, and can rate the shop.", "Public board page; ratings update the shop's average and Guild Score and notify the mechanic.", "Insight 4"],
  ["Guild Academy", "Skills & badges", "Short step-by-step lessons (tubeless repair, EV tyres, reading wear, safe fitment, talking to riders, monsoon grip) with a quiz per module.", "Per-module quiz bank; passing issues a credential code shown on the shop board.", "Status · Quality"],
  ["Guild Passport", "Financial inclusion", "Verified work history becomes a credit line and insurance eligibility through a lending partner.", "Limit derived from Guild Score and verified fitments; instant approve / review / decline with EMI estimate.", "Sustainability"],
  ["Guild Circles", "Peer pods", "8–10 nearby shops with a Grandmaster mentor share a goal; hitting it unlocks a shared machine (e.g. nitrogen inflator).", "Circle leaderboard with 30-day fitments and collective progress.", "Scalability · Community"],
  ["Seasonal Quests", "Engagement after sign-up", "Monsoon Grip Drive, Festive Ride Safe, EV Pioneer and Word of Mouth missions with points and non-cash rewards.", "Progress computed from real scans, checks and referrals; claim once, notified on completion.", "Sustainability"],
  ["Guild Coach", "Personal daily plan", "Each morning the app shows the few actions that will grow this shop today, e.g. \"9 fitments until you own the changer\".", "Explainable rule engine over the shop's own data; each card cites its number and links to the fix.", "Habit formation"],
  ["Fleet Pit Pass", "B2B customers", "Gig-delivery fleets pay a small monthly fee per rider for priority tyre care at Guild shops; mechanics get guaranteed volume.", "FleetAccount with jobs, downtime and hours saved; SOS from pass holders gets priority.", "Customers · Revenue"],
  ["Guild Score", "One advocacy index", "0–1000 score: fitments 30%, redeemed referrals 30%, rider rating 15%, skills 15%, consistency 10%, with a fraud penalty.", "Computed per shop; drives tiers, SOS ranking and Influence Graph.", "Measurability"],
  ["Lift Engine", "True incrementality", "Matched pilot and control districts; difference-in-differences on replacement share isolates the Guild's real effect.", "District cohort data; Command Centre shows per-district lift and the overall estimate.", "Measurability"],
  ["Influence Graph", "Smart spend", "Ranks shops by redeemed referrals and conversion, highlighting non-stocking super-advocates.", "Aggregation over referrals; used to target visibility kits and leads.", "Insight 5 · Cost"],
  ["Fraud Guard", "Trust", "Every scan is checked for duplicate serials, scan velocity and distance from the registered shop before points are credited.", "Rules engine with alerts the brand can resolve; open alerts reduce the Guild Score.", "Measurability"],
  ["Nudge Engine", "Churn prevention", "Ranks shops by churn risk (falling fitments, broken streaks, stalled EMIs, unredeemed codes) with the cheapest next action.", "Risk model per shop; field officer logs the visit in one tap.", "Sustainability · Cost"],
  ["Budget Autopilot", "Spend follows lift", "Next month's district budgets shift toward measured lift × active shops, capped at ±25% so field teams can plan.", "Explainable allocation rule; Command Centre table.", "Cost-effectiveness"],
  ["Rollout Simulator", "Plan before you spend", "Budget, districts, spend mix and incrementality sliders show enrolment, active shops, incremental tyres, revenue and ROI, with every assumption shown.", "Python model exposed as an API; compare the Guild mix with a cash-scheme style mix.", "Feasibility"],
];

function features() {
  const out = [H1("7. Feature deep dive"),
    P("Grip Guild has 22 integrated features. Each is implemented in the prototype and connected to the shared backend. The table gives the summary; the cards that follow explain how each one works and which brief requirement it serves."),
    table([["#", "Feature", "Role", "Brief link"], ...FEATURES.map((f, i) => [String(i + 1), `**${f[0]}**`, f[1], f[4]])], [5, 30, 33, 32]),
    spacer(),
    ...image("screens/features.jpg", 680, "Figure 8. Feature bento on the landing page.")];
  FEATURES.forEach((f, i) => {
    out.push(H3(`7.${i + 1} ${f[0]}`));
    out.push(table([["What it does", "How it works in the prototype"], [f[2], f[3]]], [50, 50], { headFill: i % 2 ? "374151" : C.ink, zebra: false }));
    out.push(spacer(60));
  });
  return out;
}

function flows() {
  return [
    H1("8. Integrated ecosystem flows"),
    P("The prototype is not a set of static screens. Every action writes to one FastAPI backend and reaches the other personas in real time (the mechanic app polls its inbox every four seconds). Three flows show how the ecosystem works."),
    H2("8.1 Puncture SOS: rider → mechanic → brand"),
    ...image("sos_sequence.png", 680, "Figure 9. The SOS lifecycle across rider, API, mechanic and Command Centre."),
    imagePair("screens/rider.jpg", "screens/ravi_sos.jpg", "Priya's SOS radar finds the three nearest Guild shops", "Ravi's app shows the live SOS lead from his Guild Coach"),
    spacer(),
    H2("8.2 Ghost Shelf: influence without inventory"),
    ...image("ghost_flow.png", 680, "Figure 10. Ghost Shelf turns a non-stocking shop's recommendation into a sale."),
    imagePair("screens/dealer.jpg", "screens/inbox.jpg", "Dealer queue: redeem referral codes and dispatch Ghost Shelf orders", "Mechanic inbox: SOS leads, Boomerang reminders and live activity"),
    spacer(),
    H2("8.3 Referral and Boomerang loops"),
    table([
      ["Step", "Referral loop (no stock needed)", "Customer Boomerang loop"],
      ["1", "Mechanic generates code on app or WhatsApp", "Fitment registers rider, tyre and due date"],
      ["2", "Rider shows the code at the nearest dealer", "Inbox lists riders due back in the next 45 days"],
      ["3", "Dealer redeems → mechanic notified, +80 pts", "One tap sends a personalised WhatsApp reminder"],
      ["4", "Influence Graph and Guild Score update", "Rider returns to the same shop for a TreadLens check"],
      ["5", "Brand sees the sale traced to a shop", "Check updates the Tyre Twin and may trigger a replacement"],
    ], [8, 46, 46]),
  ];
}

function unique() {
  return [
    H1("9. What makes Grip Guild different"),
    ...image("positioning.png", 470, "Figure 11. Grip Guild versus typical trade-influencer programmes."),
    table([
      ["Dimension", "Typical cash / QR scheme", "Grip Guild"],
      ["What is rewarded", "A purchase or a pack scan", "Purchases **and** pure influence (referrals), SOS rescues, skills, checks"],
      ["Reward currency", "Cash or discounts", "Tools to own, customers, visible status, credit access"],
      ["Inventory needed?", "Yes, you must buy to scan", "No: Ghost Shelf and referral codes"],
      ["Value to the rider", "None", "SOS rescue, health cards, verified shops, genuine-tyre check"],
      ["Retention mechanism", "Bonus size", "Tool EMI, tier upkeep, quests, streaks, repeat customers"],
      ["Measurement", "Scan counts", "Guild Score, Influence Graph, Lift Engine vs control, fraud rules"],
      ["Data for the brand", "Pack-level", "Shop-level, tyre-level (Tyre Twin) and rider-level"],
      ["Channel", "Dedicated app", "WhatsApp-first, plus web app and consoles"],
    ], [22, 34, 44], { firstBold: true }),
    spacer(),
    callout("Five ideas we have not seen in any tyre or auto-parts programme", [
      "**Fitments Pay Off Your Tools:** advocacy finances equipment the mechanic owns.",
      "**Ghost Shelf:** sell a brand you don't stock, fulfilled by the dealer within hours.",
      "**Customer Boomerang + Puncture SOS:** the brand sends the mechanic customers instead of money.",
      "**Tyre Twin:** a 3D digital record of every fitted tyre, closing the brand's rider-data gap.",
      "**Lift Engine + Budget Autopilot:** spend follows measured incrementality, not scan volume.",
    ], C.lime, C.green),
  ];
}

function prototype() {
  return [
    H1("10. Prototype walkthrough"),
    P("The prototype is live code in the GitHub repository **SDP42/grip-guild**. It runs locally with two commands and has been tested end-to-end across personas. Highlights:"),
    ...image("screens/hero.jpg", 680, "Figure 12. Landing hero: a procedural 3D tyre spins up as you scroll, then the camera dives through the hub."),
    imagePair("screens/twin_section.jpg", "screens/twin_page.jpg", "Scroll-driven exploded Tyre Twin with wear heatmap", "Tyre Twin page: genuine check, wear history, warranty"),
    spacer(),
    imagePair("screens/app_home.jpg", "screens/tiers.jpg", "Mechanic app: Guild Coach, Guild Score, wallet and tool EMI", "Tier ladder with a 3D shop board that flips as you climb"),
    spacer(),
    imagePair("screens/command_lower.jpg", "screens/simulator.jpg", "Command Centre: lift, Influence Graph, Fraud Guard, Autopilot", "Rollout simulator: every assumption visible"),
    spacer(),
    imagePair("screens/impact.jpg", "screens/command_top.jpg", "Live impact numbers pulled from the API", "Command Centre KPIs and channel trend"),
    spacer(),
    table([
      ["Screen", "Route", "What you can do"],
      ["Landing", "/", "3D tyre hero, ignition preloader, scroll speedometer, insights, pillars, personas, features, Tyre Twin, tiers, impact"],
      ["Persona picker", "/personas", "Choose any of the 8 personas"],
      ["Mechanic app", "/app?persona=…", "Coach, scan with Fraud Guard, refer, Ghost Shelf, tools, TreadLens, Academy, quests, Circle, Passport, inbox, bot"],
      ["Rider", "/rider", "Puncture SOS with live status, Fleet Pit Pass, genuine check, messages from shops"],
      ["Shop board / card", "/board/[id], /card/[id]", "Public pages a rider reaches by scanning a QR; rate the shop"],
      ["Dealer", "/dealer", "Redeem referral codes, move Ghost Shelf orders"],
      ["Field officer", "/field", "Nudge Engine ranking, log visits"],
      ["Brand", "/command, /simulator", "KPIs, funnel, district map, lift, autopilot, influence, fraud; scenario planning"],
    ], [18, 22, 60], { firstBold: true }),
  ];
}

module.exports = { solution, features, flows, unique, prototype, FEATURES };
