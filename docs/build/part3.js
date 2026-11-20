const fs = require("fs");
const path = require("path");
const L = require("./lib");
const { C, P, H1, H2, H3, bullet, image, table, callout, tiles, sideBySide, imagePair, spacer } = L;
const sim = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../assets/sim25.json"), "utf8"));
const n = (x) => Math.round(x).toLocaleString("en-IN");

function tech() {
  return [
    H1("11. Technology: stack and architecture"),
    P("The prototype is built the way the production system would be: a typed Python API with explicit services, and a modern React frontend that works on any screen. Everything is open source and inexpensive to host."),
    ...image("architecture.png", 680, "Figure 13. Layered architecture: channels, frontend, API, intelligence services, data."),
    H2("11.1 Tech stack"),
    table([
      ["Layer", "Technology", "Why we chose it"],
      ["Backend API", "Python 3.12, **FastAPI**, Pydantic v2, Uvicorn", "Fast, typed, auto-generated OpenAPI docs; the language of data science for scoring and lift models"],
      ["Data access", "**SQLModel** (SQLAlchemy) on SQLite → PostgreSQL", "One model layer for validation and storage; zero-setup demo, production-grade migration path"],
      ["Testing", "pytest + FastAPI TestClient", "End-to-end tests for scans, fraud, SOS lifecycle, referrals, quests, credit, dealer and field flows"],
      ["Frontend", "**Next.js 15** (App Router), React 19, TypeScript", "Static and dynamic pages, fast routing, easy deployment to Vercel"],
      ["Styling", "Tailwind CSS with custom design tokens", "Consistent dark automotive theme; responsive from 360 px phones to wide screens"],
      ["3D & motion", "**Three.js** via React Three Fiber and drei, **GSAP ScrollTrigger**, **Lenis**, Framer Motion", "Procedural 3D tyre and Tyre Twin; scroll-scrubbed camera; smooth, physics-feel transitions"],
      ["Charts", "Recharts (web), Matplotlib (report)", "Live dashboards and print-quality figures from the same data"],
      ["Messaging", "WhatsApp Business Cloud API (production), in-browser bot simulator (prototype)", "Where mechanics already are; no app install"],
      ["Video assets", "ffmpeg frame-sequence pipeline", "Scroll-scrubbed cinematic sections from licensed clips"],
      ["Ops", "GitHub, Vercel (web), Render / Railway / AWS (API), Postgres", "Low cost, auto-scaling, CI-friendly"],
    ], [16, 38, 46], { firstBold: true }),
    spacer(),
    H2("11.2 Backend modules"),
    table([
      ["Router / service", "Responsibility", "Key endpoints"],
      ["personas, mechanics", "Persona catalogue, profiles, Guild Score, Passport, quests, leaderboard", "GET /api/personas · /api/mechanics/me · /api/mechanics/{id}"],
      ["advocacy", "Verified scans, referrals, Ghost Shelf catalogue, tool leases, tiers", "POST /api/scan · /api/referrals · /api/referrals/{code}/redeem · /api/tools/lease"],
      ["live", "Cross-persona state: SOS lifecycle, inbox, Boomerang, TreadLens cards, quests, credit, boards, circles", "POST /api/sos/request · /api/sos/{id}/accept · /api/boomerang/{id}/send · /api/treadlens/save · /api/passport/apply"],
      ["ecosystem", "Rider Tyre Twin, ratings, fleets, dealer queues, Ghost Shelf orders, field nudges, autopilot", "GET /api/rider/tyre/{serial} · /api/dealer/{id}/queue · /api/field/nudges · /api/analytics/autopilot"],
      ["engage", "Guild Bot, TreadLens, Academy lessons and quizzes, SOS search, simulator", "POST /api/bot · /api/treadlens · /api/academy/{slug}/submit · /api/simulate"],
      ["analytics", "Overview KPIs, funnel, lift, time series, map, influence, fraud, circles", "GET /api/analytics/*"],
      ["services", "Guild Score, Fraud Guard, TreadLens, Nudge Engine, Guild Coach, Quests, Autopilot, Simulator, notifications", "Pure Python, unit-testable, explainable rules"],
    ], [18, 44, 38], { firstBold: true }),
    spacer(),
    ...image("data_model.png", 600, "Figure 14. Core data model with the mechanic at the centre."),
    H2("11.3 Security, privacy and scale"),
    table([
      ["Concern", "Approach"],
      ["Fraud", "Single-use serial QR codes; duplicate, velocity and geo checks before points; open alerts reduce Guild Score; brand can resolve alerts"],
      ["Privacy", "Rider phone numbers stored masked; riders opt in via WhatsApp; data used only for reminders and warranty; DPDP Act 2023 aligned consent and deletion"],
      ["Authentication (production)", "WhatsApp number as identity with OTP; role-based access for dealer, field and brand consoles"],
      ["Scale", "Stateless API behind a load balancer; Postgres with read replicas; event queue for notifications; WhatsApp templates for outbound messages"],
      ["Cost", "Open-source stack; at national scale the main variable cost is WhatsApp conversations, budgeted inside the 10% tech line"],
      ["Reliability", "Automated tests on every flow; schema versioning auto-rebuilds demo data; health endpoint for monitoring"],
    ], [24, 76], { firstBold: true }),
  ];
}

function measurement() {
  return [
    H1("12. Measurement framework"),
    P("The brief asks for \"some mechanism to track or estimate programme effectiveness, even if not a perfect measurement system\". Grip Guild goes further. Every reward requires a verified event, so measurement is a by-product of the programme, not an extra survey."),
    ...image("kpi_tree.png", 680, "Figure 15. KPI tree from the north-star metric down to the engines that compute it."),
    H2("12.1 Guild Score"),
    ...image("guild_score.png", 680, "Figure 16. Guild Score weights."),
    P("Each component is normalised to 0–1 against a realistic ceiling (e.g. 40 fitments or 20 redeemed referrals in 90 days), weighted, scaled to 1,000 and reduced by up to 40% for open fraud alerts. Bands: New (<250), Rising, Strong (≥500), Elite (≥750). Because redeemed referrals carry 30%, a non-stocking mechanic can still reach Elite, which matches brand-track insight 5."),
    H2("12.2 Lift Engine: proving incrementality"),
    P("Districts are paired by region and similar baseline share. One district in each pair gets the Guild, the other is a control. After a fixed period, the incremental lift is **(pilot change in share) − (control change in share)**: a difference-in-differences estimate that strips out seasonality and market-wide trends."),
    ...image("lift.png", 680, "Figure 17. Simulated pilot: matched pilot districts vs control districts."),
    H2("12.3 What we track"),
    table([
      ["Metric", "Definition", "Source"],
      ["Active shops (30d)", "Shops with any verified action in 30 days", "Fitments, referrals, checks"],
      ["Advocacy rate", "Redeemed referrals ÷ issued", "Dealer redemptions"],
      ["Non-stock advocates", "Non-stocking shops with ≥1 redeemed referral", "Referral + shop data"],
      ["Ghost Shelf conversion", "Orders reaching \"fitted\"", "Order lifecycle"],
      ["Retention", "Streak length, quest claims, EMI progress", "Mechanic records"],
      ["Rider trust", "Average rating, SOS rescues, card views", "Board, SOS, cards"],
      ["Fraud rate", "Flagged scans ÷ total scans", "Fraud Guard"],
      ["Incremental share", "Difference-in-differences vs control", "Lift Engine"],
    ], [24, 46, 30], { firstBold: true }),
  ];
}

function budget() {
  const per = sim.cost_per_active_shop_inr;
  return [
    H1("13. Budget and unit economics"),
    P("We plan an annual budget of **₹25 Cr**, inside the brief's 1.5–2% benchmark for a domestic two-wheeler replacement business of roughly ₹1,300–1,700 Cr. **72% of spend goes to things mechanics keep**: tools, visibility and skills."),
    sideBySide("budget.png", 400, [
      L.P("**Tools & equipment (₹10 Cr):** starter kits for every new shop, lease-to-own machines and Circle Tool Pools, bought in bulk about 20% below MRP."),
      L.P("**Visibility (₹5.5 Cr):** tiered boards from sticker to LED Living Shop Board, uniforms and shop makeovers for Grandmasters."),
      L.P("**Field & Circles (₹4.5 Cr):** onboarding, kit delivery, Nudge-driven visits and Circle meets."),
      L.P("**Academy (₹2.5 Cr)** and **bot, data & tech (₹2.5 Cr):** content, WhatsApp conversations, hosting and analytics."),
    ]),
    H2("13.1 Illustrative tool catalogue (points ≈ ₹ at bulk price)"),
    table([
      ["Item", "MRP (₹)", "Points", "Tier", "Role"],
      ["Tubeless puncture kit pro", "900", "720", "Apprentice", "Starter kit"],
      ["Digital pressure gauge", "650", "520", "Apprentice", "Starter kit"],
      ["Tread depth gauge", "350", "280", "Apprentice", "Feeds TreadLens"],
      ["Bead breaker", "3,200", "2,560", "Craftsman", "Faster changes"],
      ["Cordless impact wrench", "7,500", "6,000", "Craftsman", "Faster changes"],
      ["Manual 2W tyre changer", "6,500", "5,200", "Craftsman", "Rim-safe fitting"],
      ["2 HP air compressor", "18,000", "14,400", "Master", "Shop upgrade"],
      ["2W wheel balancer", "26,000", "20,800", "Master", "New service line"],
      ["Pneumatic 2W tyre changer", "38,000", "30,400", "Grandmaster", "3-minute fitting"],
      ["Nitrogen inflator (Circle pool)", "55,000", "44,000", "Grandmaster", "Shared by a Circle"],
    ], [34, 13, 13, 16, 24]),
    P("Prices are indicative market estimates used for planning, to be replaced by procurement quotes.", { size: 16, color: C.grey }),
    H2("13.2 Simulated year-one outcome (₹25 Cr, 120 districts)"),
    tiles([[n(sim.reachable_shops), "reachable shops"], [n(sim.enrolled), "enrolled"], [n(sim.active), "active monthly"], [n(sim.incremental_tyres), "incremental tyres"], [`${sim.roi_x}×`, "gross-profit ROI"]]),
    spacer(),
    ...image("funnel.png", 640, "Figure 18. Advocacy funnel from reachable shops to incremental tyres."),
    ...image("waterfall.png", 560, `Figure 19. Unit economics per active shop: ₹${n(per)} programme cost against incremental gross profit.`),
    ...image("scenarios.png", 680, "Figure 20. Same budget, more tyres: the Guild mix vs a cash-scheme style mix, computed by our simulator."),
    callout("Reading the numbers honestly", [
      "These are **planning estimates from our simulator**, not forecasts or Eurogrip data. Every assumption is exposed and adjustable in the prototype (/simulator) and listed in Appendix B.",
      "The key sensitivity is **incrementality** (the share of influenced fitments that would not have happened anyway). At 38% the plan returns ~1.5× gross profit; the pilot's Lift Engine is designed to measure this before national scale-up.",
    ]),
  ];
}

function rollout() {
  return [
    H1("14. Rollout plan"),
    ...image("gantt.png", 680, "Figure 21. 24-month rollout from design to national scale."),
    table([
      ["Phase", "Timing", "Scope", "Exit criteria"],
      ["0 · Design", "Months 0–2", "Tool vendors, lending partner, WhatsApp templates, dealer briefing, kit production", "Partners signed; bot live; 20 dealers trained"],
      ["1 · Pilot", "Months 2–6", "10 pilot + 10 matched control districts (~11,000 reachable shops)", "Lift ≥ +1.5 pp vs control; fraud < 2%; 50%+ monthly active"],
      ["Tune", "Month 6–7", "Re-weight points, tool catalogue and tier thresholds from pilot data", "Updated playbook"],
      ["2 · Scale", "Months 7–12", "120 districts; Guild Circles, Tool Pools, Fleet Pit Pass", "35,000 active shops; Autopilot running"],
      ["3 · National", "Months 12–24", "600+ districts; Guild Passport credit; EV specialisation", "Measured lift sustained; cost per incremental tyre ≤ ₹300"],
    ], [14, 14, 42, 30], { firstBold: true }),
    spacer(),
    H2("14.1 Operating model"),
    table([
      ["Role", "Owned by", "Responsibilities"],
      ["Programme office", "Eurogrip marketing", "Budget, points economy, partner contracts, Command Centre"],
      ["Dealers", "Eurogrip dealers", "Onboarding shops, redeeming codes, Ghost Shelf fulfilment (earning the sale)"],
      ["Field officers", "Eurogrip sales", "Kit delivery, board installs, Nudge Engine visits (~140 shops each)"],
      ["Circle mentors", "Grandmaster mechanics", "Peer coaching, Circle goals, Academy champions"],
      ["Partners", "Tool vendors, NBFC, WhatsApp BSP, gig fleets", "Supply, credit, messaging, demand"],
    ], [20, 26, 54], { firstBold: true }),
  ];
}

function feasibility() {
  return [
    H1("15. Feasibility and viability"),
    H2("15.1 Feasibility"),
    table([
      ["Lens", "Assessment", "Evidence"],
      ["Technical", "**High**: a working prototype already covers every core flow", "~45 API endpoints, automated tests, 8 persona front-ends, live cross-persona sync"],
      ["Operational", "**High**: runs through existing dealers and field teams", "Dealer-led onboarding; Nudge Engine keeps visits to ~140 shops per officer"],
      ["Behavioural", "**High**: rewards match what mechanics say they want", "Brand-track: tools > cash; visibility rising; WhatsApp-native"],
      ["Financial", "**Within budget**: ₹25 Cr inside the 1.5–2% benchmark", "Simulator: ~₹7,000 per active shop per year; ~₹280 per incremental tyre"],
      ["Timeline", "**Pilot in 8 weeks**", "Open-source stack; templates and kits are off-the-shelf"],
    ], [16, 38, 46], { firstBold: true }),
    spacer(),
    H2("15.2 Viability and sustainability"),
    P("Cash-based programmes decay because the reward ends when the payment ends. Grip Guild is designed to keep going:"),
    table([
      ["Sustainability lever", "Why advocacy persists"],
      ["Tool EMI", "A half-paid machine is a reason to keep recommending Eurogrip for months"],
      ["Tier upkeep", "Boards and perks are kept through quarterly activity, not bought once"],
      ["Repeat customers", "Boomerang reminders and SOS leads turn advocacy into the mechanic's own income"],
      ["Quests & streaks", "Seasonal missions give fresh goals four times a year"],
      ["Community", "Circles create peer pressure and pride; mentors become brand champions"],
      ["Financial access", "Guild Passport credit makes leaving the Guild costly"],
      ["Self-funding demand", "Fleet Pit Pass fees and Ghost Shelf sales add revenue that offsets programme cost"],
    ], [24, 76], { firstBold: true }),
    spacer(),
    ...image("ramp.png", 640, "Figure 22. Active-shop ramp over the first 12 months."),
  ];
}

function impact() {
  return [
    H1("16. Impact and benefits: before and after"),
    ...image("radar.png", 400, "Figure 23. Before vs after across seven dimensions (team assessment)."),
    table([
      ["Stakeholder", "Before Grip Guild", "After Grip Guild"],
      ["Mechanic", "Recommends what's in stock; cash schemes come and go; manual tools; anonymous", "Sells Eurogrip without stock; owns better tools; gets leads and repeat customers; verified status; credit access"],
      ["Rider", "Stranded with a flat; can't tell good shops from bad; no tyre history; counterfeit risk", "SOS rescue in minutes; verified shops and ratings; health cards; genuine-tyre check; timely reminders"],
      ["Dealer", "Can't reach non-stocking shops; sales depend on own footfall", "New sales from referral redemptions and Ghost Shelf orders across the area"],
      ["Field team", "Visits by habit; no visibility on drop-offs", "Nudge Engine ranks who needs a visit and what to do"],
      ["Eurogrip", "Lukewarm mechanic preference; spend hard to justify; no rider data", "Measured share lift; spend follows lift; shop-, tyre- and rider-level data; stronger brand at the point of advice"],
    ], [16, 40, 44], { firstBold: true }),
    spacer(),
    H2("16.1 Wider impact"),
    table([
      ["Area", "Impact"],
      ["Road safety", "Tread and pressure checks catch worn and under-inflated tyres before they fail, especially in the monsoon"],
      ["Livelihoods", "Informal mechanics gain productive assets, skills certificates and formal credit history"],
      ["Gig economy", "Delivery riders lose less time to punctures; fleets get predictable downtime"],
      ["EV transition", "EV-specific training and quests prepare local garages for electric scooters"],
      ["Authenticity", "Genuine-tyre checks discourage counterfeit and grey-market tyres"],
    ], [20, 80], { firstBold: true }),
  ];
}

function risks() {
  return [
    H1("17. Risks and mitigation"),
    ...image("risks.png", 470, "Figure 24. Risk heat map before mitigation."),
    table([
      ["Risk", "Mitigation"],
      ["Fake scans and collusion", "Single-use serials; velocity and geo checks; dealer-bound referral codes; Guild Score penalty; random audits by field officers"],
      ["Low digital literacy", "WhatsApp menus with numbered replies; field-assisted onboarding; dealer as first point of help"],
      ["Dealer resistance to Ghost Shelf", "Every Ghost Shelf order is a dealer sale; SLA leaderboard; dealer incentives inside the field budget"],
      ["Tool misuse or resale", "Leased tools stay Eurogrip-owned until paid off; serial-tagged; ownership only after EMI completion"],
      ["Budget overrun", "Points liability capped per district; Budget Autopilot caps changes at ±25%; quarterly re-pricing"],
      ["Competitors copy the idea", "First-mover data advantage (Tyre Twins, Guild Scores) and switching costs (EMI, tier, credit) are hard to copy"],
      ["Data privacy", "Masked numbers, explicit opt-in, purpose limitation and deletion on request (DPDP Act 2023)"],
    ], [26, 74], { firstBold: true }),
  ];
}

function roadmap() {
  return [
    H1("23. Roadmap and conclusion"),
    H2("23.1 Next features (Round 2 and beyond)"),
    table([
      ["Feature", "Idea"],
      ["Live WhatsApp number", "Move the bot from simulator to the WhatsApp Business Cloud API"],
      ["TreadLens computer vision", "Estimate tread depth and wear pattern from a phone photo on-device"],
      ["Voice-first mode", "Voice notes in and out for mechanics who prefer speaking to typing"],
      ["Smart valve-cap pilot", "Low-cost pressure sensing that sends riders back to their Guild mechanic"],
      ["Predictive stocking", "Recommend which Eurogrip sizes a shop should hold based on its Tyre Twins"],
      ["Open Guild API", "Let OEM service apps and fleet platforms book Guild shops directly"],
    ], [28, 72], { firstBold: true }),
    spacer(),
    H2("23.2 Conclusion"),
    P("Grip Guild treats the mechanic as a business owner and a professional, not a scheme participant. It answers each line of the brief: rewards mechanics actually want (tools and status, not cash), **scale** through WhatsApp, dealers and Circles, **sustainability** through owned assets, customers and tiers, and **measurement** through verified events and a control-district Lift Engine. Every idea in this report already runs in our prototype."),
    callout("Our promise to Eurogrip", ["Win the moment that decides the tyre (the mechanic's recommendation), at a measurable cost per incremental tyre, without paying cash for loyalty."], C.cream),
    spacer(),
    tiles([["Tools", "grow the workshop"], ["Customers", "fill the workshop"], ["Status", "be the master"]]),
  ];
}

function appendix() {
  return [
    H1("Appendix A. API reference (prototype)"),
    table([
      ["Method", "Endpoint", "Purpose"],
      ["GET", "/api/health", "Service health"],
      ["GET", "/api/personas", "All playable personas"],
      ["GET", "/api/mechanics/me?persona=", "Full profile, Guild Score, Passport, quests"],
      ["GET", "/api/mechanics/{id}/coach", "Guild Coach daily plan"],
      ["GET", "/api/mechanics/{id}/inbox", "Notifications, SOS leads, Boomerang list"],
      ["POST", "/api/scan", "Verified fitment with Fraud Guard"],
      ["POST", "/api/referrals · /{code}/redeem", "Issue and redeem referral codes"],
      ["GET/POST", "/api/ghost-shelf/{id} · /api/ghost-orders · /{id}/advance", "Ghost Shelf catalogue, orders, fulfilment"],
      ["POST", "/api/tools/lease", "Lease-to-own a tool"],
      ["POST", "/api/sos · /sos/request · /sos/{id}/accept · /fixed", "Puncture SOS lifecycle"],
      ["POST", "/api/boomerang/{fitment}/send", "Send a Boomerang reminder"],
      ["POST", "/api/treadlens · /treadlens/save", "Tyre health score and shareable card"],
      ["GET", "/api/rider/tyre/{serial}", "Tyre Twin and genuine check"],
      ["POST", "/api/rider/rate", "Rate a shop"],
      ["GET", "/api/board/{id} · /api/cards/{id}", "Public shop board and health card"],
      ["POST", "/api/quests/{slug}/claim", "Claim a quest reward"],
      ["POST", "/api/passport/apply", "Apply for working capital"],
      ["GET", "/api/academy · /{slug}/lesson · /quiz · POST /submit", "Guild Academy"],
      ["POST", "/api/bot", "Guild Bot message"],
      ["GET", "/api/dealer/{id}/queue · /api/field/nudges · /api/fleets", "Dealer, field and fleet consoles"],
      ["GET", "/api/analytics/overview · funnel · lift · timeseries · map · influence · fraud · autopilot", "Command Centre"],
      ["POST", "/api/simulate", "National rollout simulator"],
    ], [11, 49, 40]),
    H1("Appendix B. Simulator assumptions"),
    table([["Assumption", "Value", "Note"],
      ...Object.entries(sim.assumptions).map(([k, v]) => [k.replace(/_/g, " "), String(v), {
        shops_per_district: "Reachable 2W mechanics and puncture shops per district", enrol_rate: "Share of reachable shops that join through field-led onboarding",
        active_rate: "Enrolled shops active in a month", influenced_fitments_pm: "Eurogrip fitments or referrals per active shop per month",
        incrementality: "Share that would not have happened without the Guild", tyre_asp_inr: "Average replacement tyre selling price (₹)", gross_margin: "Gross margin on incremental tyres",
      }[k] ?? ""]),
      ["spend mix", "Tools 40 · Visibility 22 · Field 18 · Academy 10 · Tech 10", "Percent of annual budget"],
    ], [26, 30, 44], { firstBold: true }),
    spacer(),
    H1("Appendix C. Glossary and references"),
    table([
      ["Term", "Meaning"],
      ["Ghost Shelf", "Ordering Eurogrip tyres on demand for a shop that holds no stock"],
      ["Tyre Twin", "Digital record of one fitted tyre: fitment, checks, wear, warranty"],
      ["Guild Score", "0–1000 advocacy index per shop"],
      ["Lift Engine", "Difference-in-differences comparison of pilot and control districts"],
      ["Customer Boomerang", "Automated reminder that sends a rider back to the fitting mechanic"],
      ["Circle", "Pod of 8–10 nearby shops with a mentor and a shared goal"],
      ["pp", "Percentage points of market share"],
    ], [24, 76], { firstBold: true }),
    spacer(),
    P("**References.** Eurogrip × Unstop, Case Study 4 brief and brand-track insights (2026). TVS Srichakra Ltd. FY2024-25 results and management discussion (public filings; revenue as reported by stockanalysis.com). Castrol India press releases on its digital mechanic incentive platform (2019) and Super Mechanic contest (2017–2022). Industry commentary on the Indian two-wheeler after-sales market (Entrepreneur India; Inc42). Digital Personal Data Protection Act, 2023.", { size: 17 }),
    P("**Prototype.** github.com/SDP42/grip-guild: FastAPI backend (backend/), Next.js frontend (frontend/), report sources (docs/).", { size: 17 }),
  ];
}

module.exports = { tech, measurement, budget, rollout, feasibility, impact, risks, roadmap, appendix };
