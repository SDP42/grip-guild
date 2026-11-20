const { Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun, TableOfContents } = require("docx");
const fs = require("fs");
const path = require("path");
const L = require("./lib");
const { C, P, H1, H2, H3, bullet, num, image, table, callout, tiles, sideBySide, imagePair, spacer, run, CONTENT_W, noBorders } = L;
const sim = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../assets/sim25.json"), "utf8"));
const n = (x) => x.toLocaleString("en-IN");

function cover() {
  const hero = fs.readFileSync(path.resolve(__dirname, "../assets/screens/hero.jpg"));
  const band = (text, size, color, bold = true, after = 60) => new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after },
    children: [new TextRun({ text, font: L.FONT, size, color, bold })] });
  const inner = [
    band("EUROGRIP TORQ CHALLENGE 4.0  ·  CASE STUDY 4", 18, C.molten, true, 200),
    band("GRIP GUILD", 88, "FFFFFF", true, 40),
    band("Tools. Customers. Status.", 36, "F59E0B", true, 120),
    band("A scalable, measurable advocacy ecosystem that turns India's two-wheeler mechanics and puncture shops into lasting Eurogrip advocates without cash incentives.", 22, "E5E7EB", false, 240),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new ImageRun({ type: "jpg", data: hero, transformation: { width: 600, height: 375 } })] }),
    band("Solution Report  ·  Executive Summary Round", 20, "FFFFFF", true, 60),
    band("Team OUTLIERS", 28, C.molten, true, 40),
    band("Swayam Panchal  ·  Rishit Lahoti  ·  Jeevesh Bodhani", 22, "FFFFFF", false, 40),
    band("Department of Artificial Intelligence and Data Science", 20, "D1D5DB", false, 20),
    band("Dwarkadas J. Sanghvi College of Engineering, Mumbai", 20, "D1D5DB", false, 160),
    band("Working prototype: github.com/SDP42/grip-guild  ·  FastAPI + Next.js + Three.js", 17, "9CA3AF", false, 0),
  ];
  return [new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ height: { value: 15780, rule: "atLeast" }, children: [new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, borders: noBorders,
      shading: { type: ShadingType.CLEAR, color: "auto", fill: C.ink }, margins: { top: 500, bottom: 300, left: 500, right: 500 }, children: inner })] })] })];
}

// Static contents table: page numbers come from a first render pass (toc.json), so it shows in any viewer.
function tocTable() {
  let pages = {};
  try { pages = JSON.parse(fs.readFileSync(path.resolve(__dirname, "toc.json"), "utf8")); } catch {}
  const titles = ["1. Executive summary", "2. The problem", "3. Research and market understanding", "4. Insights to design", "5. Personas: every seat in the ecosystem",
    "6. The solution: Grip Guild", "7. Feature deep dive", "8. Integrated ecosystem flows", "9. What makes Grip Guild different", "10. Prototype walkthrough",
    "11. Technology: stack and architecture", "12. Measurement framework", "13. Budget and unit economics", "14. Rollout plan", "15. Feasibility and viability",
    "16. Impact and benefits: before and after", "17. Risks and mitigation", "19. A day in the Guild", "20. Pilot experiment design", "21. Points economy and liability control", "22. Evaluation-criteria scorecard", "23. Roadmap and conclusion", "Appendix A. API reference (prototype)",
    "Appendix B. Simulator assumptions", "Appendix C. Glossary and references"];
  const half = Math.ceil(titles.length / 2);
  const rows = [];
  for (let i = 0; i < half; i++) {
    const a = titles[i], b = titles[i + half];
    rows.push([a, String(pages[a] ?? "–"), b ?? "", b ? String(pages[b] ?? "–") : ""]);
  }
  return [table([["Section", "Page", "Section", "Page"], ...rows], [41, 9, 41, 9])];
}

function control() {
  return [
    new Paragraph({ pageBreakBefore: true, children: [run("Document at a glance", { bold: true, size: 30, color: C.ink })], spacing: { after: 120 } }),
    table([
      ["Item", "Detail"],
      ["Competition", "Eurogrip TORQ Challenge 4.0 (TVS Srichakra Ltd. × Unstop)"],
      ["Problem statement", "Case Study 4: build a scalable, cost-effective influencer advocacy ecosystem with mechanics and puncture shops in the domestic two-wheeler market"],
      ["Our answer", "Grip Guild: a guild for mechanics that pays in tools, customers and status instead of cash, and measures every recommendation"],
      ["Team", "Outliers: Swayam Panchal (team leader), Rishit Lahoti, Jeevesh Bodhani"],
      ["Institute", "Dwarkadas J. Sanghvi College of Engineering, Department of Artificial Intelligence and Data Science"],
      ["Prototype", "Fully functional web platform: FastAPI (Python) backend with ~45 endpoints and automated tests; Next.js 15 frontend with 3D, 8 playable personas and live cross-persona flows"],
      ["Data note", "All pilot, district and shop figures in this report come from the prototype's simulated dataset or clearly labelled planning assumptions. They are not Eurogrip data."],
    ], [22, 78], { firstBold: true }),
    spacer(120),
    tiles([["3", "pillars: Tools · Customers · Status"], ["20+", "integrated features"], ["8", "playable personas"], ["₹25 Cr", "annual plan (within 1.5–2%)"], ["+3.75 pp", "simulated share lift vs control"]]),
    spacer(160),
    new Paragraph({ children: [run("Contents", { bold: true, size: 30, color: C.ink })], spacing: { after: 80 } }),
    ...tocTable(),
    spacer(140),
    new Paragraph({ children: [run("The solution on one page", { bold: true, size: 30, color: C.ink })], spacing: { after: 80 } }),
    table([
      ["Problem", "Solution", "Impact"],
      ["Mechanics decide most two-wheeler tyre replacements, but Eurogrip awareness among them is lukewarm, stocking lags competitors and recommendations rarely favour the brand.",
       "**Grip Guild:** a guild that pays in **tools** (lease-to-own machines), **customers** (SOS leads, Boomerang reminders, Ghost Shelf, Fleet Pit Pass) and **status** (tiers, Living Shop Board, Academy, Passport). No cash.",
       "Simulated year 1 at ₹25 Cr: ~35,000 active shops, ~8.8 lakh incremental tyres, ~₹128 Cr incremental revenue, ~₹280 per extra tyre, +3.75 pp share lift vs control in the pilot model."],
      ["Cash schemes fade after launch and reward purchase, not influence. Non-stockers who already advocate get nothing.",
       "**Influence without inventory:** referral codes (80 pts) and Ghost Shelf (60 pts) reward recommendation even with zero stock.",
       "Advocacy persists through owned tools, tier upkeep, quests and repeat customers rather than a one-time payment."],
      ["The programme must be national, cost-effective and measurable.",
       "WhatsApp-first; dealer and field onboarding; **Guild Score, Lift Engine, Influence Graph, Fraud Guard, Nudge Engine, Budget Autopilot**.",
       "Every reward is a verified event, so measurement is built in; spend follows measured lift."],
    ], [32, 36, 32]),
  ];
}

function executive() {
  return [
    H1("1. Executive summary"),
    P("A mechanic or puncture-shop owner is usually the person who tells a two-wheeler rider which tyre to buy. Eurogrip's own mechanic brand-track shows the gap: **awareness is lukewarm, stocking lags competitors, and recommendations do not favour Eurogrip.** It also shows the way out. Mechanics now rank **tools and equipment above cash**, they increasingly want **visible status**, and **some already recommend Eurogrip without stocking it.**"),
    P("**Grip Guild** is our answer. It is a national guild for two-wheeler mechanics, built on one idea: **we don't pay mechanics, we make them more successful.** Every verified Eurogrip fitment, referral or tyre check earns points that turn into three things that compound:"),
    table([
      ["Pillar", "What the mechanic gets", "Signature features"],
      ["**Tools**", "Equipment that grows the workshop, owned not rented", "Fitments Pay Off Your Tools (rent-to-own EMI in points) · Starter kit · Circle Tool Pools · Tool Store"],
      ["**Customers**", "More riders walking in, and the same riders coming back", "Puncture SOS leads · Customer Boomerang reminders · Ghost Shelf (sell without stock) · Fleet Pit Pass for gig fleets"],
      ["**Status**", "A reputation riders can see and verify", "Apprentice → Grandmaster ladder · Living Shop Board with verify-QR · Guild Academy badges · Guild Passport (credit & insurance)"],
    ], [14, 34, 52], { firstBold: true }),
    spacer(),
    P("Measurement is built in. A **Guild Score** rates each shop's advocacy, including influence without inventory. A **Lift Engine** compares matched pilot and control districts (difference-in-differences). An **Influence Graph** finds the shops whose word sells tyres, **Fraud Guard** checks every scan, a **Nudge Engine** flags shops drifting away before they churn, and **Budget Autopilot** moves spend towards districts with proven lift."),
    P("Reach is **WhatsApp-first**: a mechanic needs no new app or training. The same backend powers a mobile web app, dealer and field consoles, rider pages and a brand **Command Centre**. Every fitted tyre also gets a **Tyre Twin**, a 3D digital record with a wear heatmap, wear history, warranty and a genuine-tyre check. It closes Eurogrip's biggest blind spot: today it rarely knows who rides its tyres."),
    callout("Why this wins on the five judging criteria", [
      "**Incentive realism:** rewards match the brand-track shift exactly: tools first, then visibility and status, with cash nowhere in the core loop.",
      "**Insight-grounding:** each of the five brand-track insights maps to specific features (Section 5).",
      "**Scalability:** WhatsApp-first, dealer-led onboarding, Circles of 8–10 shops and a simulator sized to 600+ districts.",
      "**Sustainability:** rent-to-own tools, tier upkeep, quests, streaks and repeat customers keep advocacy alive after sign-up.",
      "**Measurability:** every action is a verified event; the Lift Engine isolates true incrementality against control districts.",
    ]),
    spacer(),
    tiles([[n(sim.enrolled), "shops enrolled (yr 1)"], [n(sim.active), "active monthly"], [n(sim.incremental_tyres), "incremental tyres / yr"], [`₹${sim.incremental_revenue_cr} Cr`, "incremental revenue"], [`₹${sim.cost_per_incremental_tyre_inr}`, "cost per extra tyre"]]),
    P("Figures above: output of our rollout simulator at ₹25 Cr across 120 districts, using the planning assumptions listed in Appendix B.", { size: 16, color: C.grey, align: AlignmentType.CENTER }),
    ...image("flywheel.png", 420, "Figure 1. The Guild flywheel: each turn makes the next recommendation more likely."),
  ];
}

function problem() {
  return [
    H1("2. The problem"),
    H2("2.1 The brief"),
    P("Case Study 4 asks how Eurogrip can build a **scalable, cost-effective advocacy ecosystem with mechanics and puncture shops across India**: one that drives genuine, lasting recommendation **without relying on high-cost, one-off incentives** that are hard to sustain or track. The solution must be national in scale, sustained beyond the sign-up incentive, measurable even if imperfectly, and affordable within **1.5–2% of the relevant business-unit revenue**."),
    H2("2.2 Why the mechanic matters"),
    sideBySide("screens/tagline.jpg", 300, [
      P("At replacement time most riders do not research tyres. They walk into the nearest puncture shop or garage and ask, **\"Which tyre should I put?\"** The answer usually decides the sale. Mechanics are trusted, local and visited far more often than dealers. A rider might see a dealer once every few years but a puncture shop several times a year."),
      P("That makes the mechanic the most influential, and least structured, touchpoint in a two-wheeler owner's journey. Influence today is informal, inconsistent and invisible to the brand."),
    ]),
    H2("2.3 What Eurogrip's brand-track tells us"),
    table([
      ["#", "Brand-track finding", "What it really means"],
      ["1", "Awareness among mechanics is average / lukewarm", "Eurogrip is known. The gap is conversion into stocking and recommendation, not awareness."],
      ["2", "Stocking lags well behind competing brands", "Mechanics without stock default to brands they carry. Inventory is a barrier to advocacy."],
      ["3", "Functional support (tools to change tyres) now beats cash and pricing", "Mechanics want help growing their business, not short-lived cash."],
      ["4", "Preference for visibility items (boards, uniforms, merchandise) is rising fast", "Status and association with a strong brand are motivators in their own right."],
      ["5", "Meaningful advocacy comes from mechanics who don't stock Eurogrip", "Influence and inventory are different. Advocacy can be built and rewarded on its own."],
    ], [5, 40, 55]),
    spacer(),
    H2("2.4 Root causes"),
    P("We traced the weak recommendation rate to six root causes. Each is something a programme can change:"),
    table([
      ["Root cause", "Symptom at the shop", "Implication for design"],
      ["No inventory, no recommendation", "\"I recommend what I have on the shelf.\"", "Let shops sell Eurogrip without stocking (Ghost Shelf) and reward pure referrals."],
      ["Cash schemes are transactional", "Engagement spikes at launch then fades", "Reward with assets that keep paying back: tools, customers, status."],
      ["The brand is invisible at the point of advice", "Riders see competitor boards and branded uniforms", "A visible, tiered Living Shop Board and uniforms the mechanic earns."],
      ["No feedback loop", "The mechanic never learns whether a rider bought", "Referral codes and verified fitments close the loop instantly on WhatsApp."],
      ["No data on end riders", "Eurogrip cannot target or retain riders", "Every fitment registers a Tyre Twin and a rider for Boomerang reminders."],
      ["Fragmented, low-digital universe", "Apps go uninstalled; field teams can't visit everyone", "WhatsApp-first design plus a Nudge Engine that focuses field visits."],
    ], [26, 33, 41], { firstBold: true }),
    spacer(),
    callout("Problem statement in one line", ["Eurogrip needs mechanics to **recommend** it, but mechanics recommend what they **stock**, what **pays them sustainably**, and what makes them **look good to riders**. Today Eurogrip wins on none of the three."], C.lime, C.green),
  ];
}

function research() {
  return [
    H1("3. Research and market understanding"),
    H2("3.1 The company and the market"),
    P("Eurogrip is the tyre brand of **TVS Srichakra Ltd.**, a leading Indian two- and three-wheeler tyre maker that supplies major OEMs and sells through a large aftermarket network. Publicly reported revenue for FY2024-25 was about **₹3,254 crore**, and the company reported that it held its share in the replacement market despite intense competition. The two-wheeler replacement market is served mainly through unorganised local garages and puncture shops, which industry commentary estimates handle about **80% of two-wheeler after-sales servicing**."),
    table([
      ["Planning lens", "Assumption we use", "Why"],
      ["Relevant BU revenue", "~₹1,300–1,700 Cr (domestic 2W replacement)", "Roughly half of company revenue; to be confirmed with Eurogrip"],
      ["Budget (1.5–2%)", "₹20–34 Cr per year → we plan **₹25 Cr**", "Inside the brief's benchmark with headroom"],
      ["Reachable shops", "~1,100 two-wheeler mechanics / puncture shops per district", "Conservative planning figure for urban + semi-urban districts"],
      ["Rollout", "120 districts in year 1, 600+ by year 2", "Phased: pilot → scale → national"],
      ["Tyre selling price", "₹1,450 average replacement tyre", "Blend of commuter, scooter and premium sizes"],
    ], [24, 40, 36], { firstBold: true }),
    spacer(),
    H2("3.2 Benchmark programmes in adjacent categories"),
    P("Trade-influencer programmes are common in lubricants, paints, adhesives and batteries. We studied what they do well and where they stop short:"),
    table([
      ["Programme type", "How it works", "What works", "Where it stops short"],
      ["Lubricant QR-cash loyalty (e.g. Castrol's digital incentive platform, 1.5 lakh+ mechanics and retailers enrolled, 2019)", "Mechanic scans a QR under the cap and gets a random cash bonus", "Scale, simplicity, verified purchase", "Cash only; rewards purchase, not influence; engagement tied to bonus size"],
      ["Mechanic skill contests (e.g. Castrol Super Mechanic)", "National skill contest with TV tie-ins", "Status and pride; brand halo", "Episodic; reaches a small top tier; hard to tie to sales"],
      ["Paint / adhesive contractor clubs", "Points per pack, tiered clubs, events, insurance", "Tiering and community; long tenure", "Mostly purchase-based; little rider-facing value"],
      ["Tyre trade schemes", "Dealer discounts, slab schemes, merchandise drops", "Easy to run through dealers", "Do not reach non-stocking mechanics; not measurable at shop level"],
    ], [27, 25, 20, 28]),
    spacer(),
    callout("What no programme does today", [
      "Rewards a mechanic for **influence without inventory**.",
      "Gives the mechanic **customers** (leads, reminders, rescues), not just rewards.",
      "Pays in **productive assets** the mechanic will own, financed by their own advocacy.",
      "Measures **true incrementality** against control districts instead of counting scans.",
      "Gives the brand a **digital twin of every fitted tyre** and a link to the end rider.",
    ], C.lime, C.green),
    spacer(),
    H2("3.3 Who the mechanic is"),
    P("From field reasoning and the brand-track insights we built a profile of the typical two-wheeler mechanic: the owner of a 1–3 person shop with a compressor and hand tools, earns per job, keeps thin inventory and is busy from morning to night. Smartphone and WhatsApp use is near-universal, but app installs are rare and quickly abandoned. Reputation in the neighbourhood is the shop's main asset, and the owner values anything that **saves time per job, brings more customers, or makes the shop look professional**."),
    table([
      ["Need", "Today's reality", "Grip Guild response"],
      ["Faster jobs", "Manual tyre changes take 15–25 minutes", "Lease-to-own tyre changers, bead breakers, impact wrenches"],
      ["More footfall", "Depends on location and word of mouth", "Puncture SOS leads, Boomerang reminders, Fleet Pit Pass volume"],
      ["Working capital", "Informal borrowing at high cost", "Guild Passport: verified history unlocks a credit line"],
      ["Respect", "Seen as \"just a puncture-wala\"", "Certified tiers, branded board, verifiable badges"],
      ["Simplicity", "No time for apps or forms", "Everything works on WhatsApp in a few taps"],
    ], [18, 38, 44], { firstBold: true }),
  ];
}

function insights() {
  return [
    H1("4. Insights to design"),
    P("We turned each brand-track finding into a design rule, then built features to satisfy every rule. The mapping below is the backbone of the solution."),
    ...image("insight_map.png", 680, "Figure 2. Every insight from the brief maps to specific Grip Guild features."),
    table([
      ["Design rule", "Derived from", "How the prototype implements it"],
      ["Reward influence, not just purchase", "Insight 5", "Referral codes redeemed at dealers earn 80 points, more than a stocked fitment (50)"],
      ["Remove the inventory barrier", "Insight 2", "Ghost Shelf orders route to the nearest dealer with a 2–6 hour SLA; fitments earn 60 points"],
      ["Pay in assets that compound", "Insight 3", "Half of every fitment's points go to an EMI on a leased tool until the mechanic owns it"],
      ["Make status visible and earned", "Insight 4", "Four tiers, each unlocking a better shop board, uniform and perks; boards carry a verify-QR"],
      ["Convert awareness into habit", "Insight 1", "Guild Coach daily plan, weekly streaks, seasonal quests and Circle goals"],
      ["Measure true lift", "Brief constraint", "Pilot vs matched control districts; difference-in-differences on replacement share"],
    ], [26, 16, 58], { firstBold: true }),
    spacer(),
    ...image("screens/insights.jpg", 680, "Figure 3. The landing page decodes the five insights in a pinned horizontal scroll."),
  ];
}

function personas() {
  return [
    H1("5. Personas: every seat in the ecosystem"),
    P("Advocacy only lasts if every party gains. We designed for eight personas, and each one can be played end-to-end in the prototype. Actions in one persona's screen change what the others see."),
    table([
      ["Persona", "Who", "Pain today", "What Grip Guild gives them"],
      ["**Ravi Kumar**", "Puncture shop, Pune. Doesn't stock Eurogrip. Master tier.", "Loses tyre sales he can't fulfil; no tools beyond a compressor", "Ghost Shelf, referral points, a pneumatic changer 70% paid by fitments"],
      ["**Gurpreet Singh**", "Multi-brand garage, Ludhiana. Grandmaster, Circle mentor.", "No recognition for being the best shop in the area", "Top-tier board, mentor role, Circle tool pool, seasonal quests"],
      ["**Imran Shaikh**", "New puncture shop, Lucknow. Apprentice, day 6.", "Low skills confidence, few customers", "Starter kit, Academy quiz, first-scan guidance from Guild Coach"],
      ["**Lakshmi Reddy**", "EV-first garage, Chennai. Craftsman.", "EV tyre know-how is scarce; needs capital", "EV Pioneer quest, EV Ready badge, Guild Passport credit"],
      ["**Priya Nair**", "Gig delivery rider, Pune", "A flat tyre costs a shift; no trusted mechanic", "Puncture SOS, Fleet Pit Pass priority, genuine-tyre check, health card"],
      ["**Pune dealer**", "Eurogrip dealer serving Ravi's area", "Can't reach non-stocking shops", "Referral redemptions and Ghost Shelf orders as new sales"],
      ["**Anita Desai**", "Eurogrip field officer, 140 shops", "Can't visit everyone; doesn't know who is drifting", "Nudge Engine ranks shops by churn risk with the next best action"],
      ["**Brand manager**", "Eurogrip marketing", "Can't prove the programme works", "Command Centre: funnel, lift vs control, Influence Graph, fraud, Autopilot"],
    ], [15, 25, 27, 33]),
    spacer(),
    ...image("screens/personas.jpg", 680, "Figure 4. Persona picker in the prototype: each card opens a working product on the same live backend."),
    ...image("stakeholders.png", 520, "Figure 5. Value created for each stakeholder (team assessment)."),
  ];
}

module.exports = { cover, control, executive, problem, research, insights, personas };
