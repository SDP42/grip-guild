// One-slide executive summary for Eurogrip TORQ 4.0 (Round 1), Team Outliers.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");

const A = (f) => path.resolve(__dirname, "../assets", f);
const sim = JSON.parse(fs.readFileSync(A("sim25.json"), "utf8"));
const DRIVE = process.env.DRIVE_LINK || "Drive link: shared with submission";

const BG = "0E1014", CARD = "181B22", CARD2 = "20242C", LINE = "2C313B";
const WHITE = "F4F1EA", DIM = "B9B5AC", MUTE = "8A8F99";
const MOLTEN = "FF5A1F", AMBER = "F5A524", LIME = "A3E635", SKY = "38BDF8", VIOLET = "A78BFA", ROSE = "FB7185";
const FONT = "Arial";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.title = "Grip Guild — Executive Summary";
pres.author = "Team Outliers";
pres.company = "Dwarkadas J. Sanghvi College of Engineering";

const s = pres.addSlide();
s.background = { color: BG };

const card = (x, y, w, h, fill = CARD) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08 });

const head = (x, y, w, num, text, color) => {
  s.addShape(pres.shapes.OVAL, { x, y: y + 0.02, w: 0.24, h: 0.24, fill: { color } });
  s.addText(num, { x, y: y + 0.02, w: 0.24, h: 0.24, fontFace: FONT, fontSize: 8, bold: true, color: BG, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(text, { x: x + 0.3, y: y - 0.01, w: w - 0.3, h: 0.3, fontFace: FONT, fontSize: 10.5, bold: true, color, margin: 0, valign: "middle", charSpacing: 1, isTextBox: true });
};

// rich text helper: items are strings with **bold** spans; bullets optional
const rich = (items, { size = 8, color = DIM, bullet = false, boldColor = WHITE, para = 2 } = {}) => {
  const out = [];
  items.forEach((it, i) => {
    const parts = it.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    parts.forEach((p, j) => {
      const bold = p.startsWith("**");
      out.push({ text: bold ? p.slice(2, -2) : p, options: {
        fontFace: FONT, fontSize: size, bold, color: bold ? boldColor : color,
        bullet: j === 0 && bullet ? { indent: 9 } : undefined, paraSpaceAfter: j === parts.length - 1 ? para : 0,
        breakLine: j === parts.length - 1 && i < items.length - 1 } });
    });
  });
  return out;
};
const body = (items, x, y, w, h, opt = {}) => s.addText(rich(items, opt), { x, y, w, h, valign: "top", margin: [0, 2, 0, 2], isTextBox: true, fit: "none" });

// ───────────── HEADER ─────────────
card(0.2, 0.15, 12.93, 0.92, "15181E");
s.addText([{ text: "GRIP", options: { color: WHITE } }, { text: "GUILD", options: { color: MOLTEN } }],
  { x: 0.35, y: 0.2, w: 2.6, h: 0.55, fontFace: FONT, fontSize: 30, bold: true, margin: 0, isTextBox: true });
s.addText("Tools. Customers. Status.", { x: 0.35, y: 0.72, w: 2.7, h: 0.28, fontFace: FONT, fontSize: 11, bold: true, color: AMBER, margin: 0, isTextBox: true });
s.addText([
  { text: "We don't pay mechanics. We make them more successful. ", options: { bold: true, color: WHITE, fontSize: 12.5 } },
  { text: "A WhatsApp-first guild that turns India's two-wheeler mechanics & puncture shops into lasting, measurable Eurogrip advocates, rewarding them with ", options: { color: DIM, fontSize: 9.5 } },
  { text: "tools they own, customers they keep and status riders can see", options: { color: LIME, fontSize: 9.5, bold: true } },
  { text: ", never cash. Eurogrip TORQ Challenge 4.0 · Case Study 4.", options: { color: DIM, fontSize: 9.5 } },
], { x: 3.1, y: 0.2, w: 6.25, h: 0.82, fontFace: FONT, valign: "middle", margin: 0, isTextBox: true });
s.addImage({ path: A("qr_live.png"), x: 9.45, y: 0.22, w: 0.78, h: 0.78 });
s.addText([
  { text: "TEAM OUTLIERS", options: { bold: true, color: MOLTEN, fontSize: 9.5, breakLine: true } },
  { text: "Swayam Panchal · Rishit Lahoti · Jeevesh Bodhani", options: { bold: true, color: WHITE, fontSize: 8, breakLine: true } },
  { text: "AI & Data Science · Dwarkadas J. Sanghvi College of Engg.", options: { color: DIM, fontSize: 7.5, breakLine: true } },
  { text: "Live: ", options: { color: MUTE, fontSize: 7.5 } }, { text: "gripguild-outliers.vercel.app", options: { color: SKY, fontSize: 7.5, bold: true, hyperlink: { url: "https://gripguild-outliers.vercel.app/" }, breakLine: true } },
  { text: "Code: ", options: { color: MUTE, fontSize: 7.5 } }, { text: "github.com/SDP42/grip-guild", options: { color: SKY, fontSize: 7.5, bold: true, hyperlink: { url: "https://github.com/SDP42/grip-guild" }, breakLine: true } },
  { text: "32-page report (PDF): ", options: { color: MUTE, fontSize: 7.5 } }, { text: DRIVE, options: { color: SKY, fontSize: 7.5, bold: true, ...(DRIVE.startsWith("http") ? { hyperlink: { url: DRIVE } } : {}) } },
], { x: 10.3, y: 0.18, w: 2.8, h: 0.86, fontFace: FONT, valign: "middle", margin: 0, isTextBox: true });
s.addText("Scan → live demo", { x: 9.35, y: 0.98, w: 0.98, h: 0.12, fontFace: FONT, fontSize: 5.5, color: MUTE, align: "center", margin: 0, isTextBox: true });

// ───────────── ROW A ─────────────
const yA = 1.17, hA = 2.38;
// Problem
card(0.2, yA, 3.0, hA);
head(0.32, yA + 0.08, 2.8, "1", "THE PROBLEM", ROSE);
body([
  "**Mechanics decide the tyre.** Riders ask the nearest puncture shop \"which tyre?\" at replacement.",
  "**Lukewarm awareness**: Eurogrip is known but not recommended.",
  "**Stocking lags** competitors, and shops recommend what's on their shelf.",
  "**Tools > cash** is now mechanics' #1 ask; cash schemes fade after launch.",
  "**Status matters**: demand for boards & uniforms is rising fast.",
  "**Non-stockers already advocate**, yet no scheme rewards influence without inventory.",
  "**Eurogrip's blind spot**: no data on who rides its tyres or which shops sell them.",
], 0.3, yA + 0.4, 2.85, hA - 0.45, { size: 7.6 });

// Solution: three pillars
card(3.3, yA, 4.2, hA);
head(3.42, yA + 0.08, 4.0, "2", "OUR SOLUTION · 3 PILLARS, 22 FEATURES", MOLTEN);
const pillars = [
  ["TOOLS", "grow the workshop", MOLTEN, ["**Fitments Pay Off Your Tools**: ½ of every fitment's points pay an EMI on a machine the shop will own", "**Starter kit** day 1 · **Tool Store** · **Circle Tool Pools**"]],
  ["CUSTOMERS", "fill the workshop", LIME, ["**Puncture SOS** leads · **Customer Boomerang** reminders", "**Ghost Shelf**: sell Eurogrip with zero stock, dealer delivers in 2–6 h", "**Fleet Pit Pass** for gig-delivery fleets"]],
  ["STATUS", "be the master", AMBER, ["**Apprentice → Grandmaster** ladder", "**Living Shop Board** with verify-QR & ratings", "**Academy** badges · **Guild Passport** credit"]],
];
pillars.forEach(([t, sub, c, items], i) => {
  const x = 3.4 + i * 1.37;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: yA + 0.42, w: 1.31, h: 1.4, fill: { color: CARD2 }, line: { color: c, width: 1 }, rectRadius: 0.06 });
  s.addText([{ text: t, options: { bold: true, color: c, fontSize: 9.5, breakLine: true } }, { text: sub, options: { color: MUTE, fontSize: 6.5, italic: true } }],
    { x: x + 0.06, y: yA + 0.45, w: 1.2, h: 0.36, fontFace: FONT, margin: 0, isTextBox: true });
  body(items, x + 0.02, yA + 0.82, 1.27, 1.0, { size: 6.6, para: 1 });
});
body([
  "**WhatsApp-first Guild Bot**: no app install; scan, refer, EMI & rank by chat.",
  "**Tyre Twin (3D)**: every fitted tyre gets a wear heatmap, history, warranty & genuine check.",
  "**Guild Coach** daily plan · **TreadLens** health cards · **Seasonal Quests** · **Guild Circles**.",
], 3.4, yA + 1.86, 4.05, 0.5, { size: 6.9, para: 0 });

// Unique
card(7.6, yA, 2.6, hA);
head(7.72, yA + 0.08, 2.4, "3", "WHY IT'S UNIQUE", LIME);
body([
  "**Influence without inventory**: referral codes (80 pts) & Ghost Shelf reward the word, not the warehouse.",
  "**Advocacy finances owned tools**, a reason to stay for months, not days.",
  "**Brand sends customers**, not cash: SOS, Boomerang, fleets.",
  "**Digital twin of every tyre** closes Eurogrip's rider-data gap & fights counterfeits.",
  "**Spend follows proven lift**: Lift Engine + Budget Autopilot.",
  "**8 personas, one live system**: mechanic, rider, dealer, field officer, brand.",
  "**Built for the street**: WhatsApp chat + 3D, phone-first UX.",
], 7.68, yA + 0.4, 2.47, hA - 0.45, { size: 7.4 });

// Prototype
card(10.3, yA, 2.83, hA);
head(10.42, yA + 0.08, 2.6, "4", "WORKING PROTOTYPE", SKY);
const shots = [["hero.jpg", "3D landing"], ["app_home.jpg", "Mechanic app"], ["twin_section.jpg", "Tyre Twin 3D"], ["command_lower.jpg", "Command Centre"]];
shots.forEach(([f, cap], i) => {
  const x = 10.38 + (i % 2) * 1.37, y = yA + 0.42 + Math.floor(i / 2) * 0.95;
  s.addImage({ path: A("screens/" + f), x, y, w: 1.31, h: 0.82, sizing: { type: "cover", w: 1.31, h: 0.82 } });
  s.addText(cap, { x, y: y + 0.82, w: 1.31, h: 0.12, fontFace: FONT, fontSize: 6, color: MUTE, align: "center", margin: 0, isTextBox: true });
});

// ───────────── ROW B ─────────────
const yB = 3.64, hB = 2.06;
// Before vs after
card(0.2, yB, 4.3, hB);
head(0.32, yB + 0.08, 4.1, "5", "BEFORE vs AFTER", AMBER);
const ba = [
  ["", "BEFORE", "WITH GRIP GUILD"],
  ["Mechanic", "Sells what's stocked; cash schemes fade; manual tools", "Sells Eurogrip with no stock; owns tools; gets leads & credit"],
  ["Rider", "Stranded with a flat; can't judge shops", "SOS rescue in minutes; verified boards; health cards"],
  ["Dealer", "Can't reach non-stocking shops", "New sales via codes & Ghost Shelf"],
  ["Field team", "Visits by habit", "Nudge Engine: who's drifting & why"],
  ["Eurogrip", "Spend unproven; no rider data", "Measured share lift; tyre- & rider-level data"],
];
s.addTable(ba.map((r, i) => r.map((c, j) => ({ text: c, options: {
  fontFace: FONT, fontSize: i === 0 ? 7 : 6.8, bold: i === 0 || j === 0, color: i === 0 ? (j === 2 ? LIME : j === 1 ? ROSE : MUTE) : j === 0 ? WHITE : j === 2 ? "E6F7C8" : DIM,
  fill: { color: i === 0 ? "14171D" : i % 2 ? CARD2 : CARD }, margin: [2, 4, 2, 4], valign: "middle" } }))),
  { x: 0.3, y: yB + 0.4, w: 4.1, colW: [0.78, 1.55, 1.77], rowH: 0.26, border: { type: "solid", pt: 0.5, color: LINE } });

// Impact tiles (simulator)
card(4.6, yB, 3.05, hB);
head(4.72, yB + 0.08, 2.9, "6", "IMPACT · YEAR 1 @ ₹25 Cr", MOLTEN);
const fmt = (n) => n.toLocaleString("en-IN");
const tilesB = [[fmt(sim.enrolled), "shops enrolled"], [fmt(sim.active), "active monthly"], [(sim.incremental_tyres / 1e5).toFixed(1) + " lakh", "incremental tyres"],
  ["₹" + Math.round(sim.incremental_revenue_cr) + " Cr", "incremental revenue"], ["₹" + sim.cost_per_incremental_tyre_inr, "cost / extra tyre"], ["+3.75 pp", "share lift vs control"]];
tilesB.forEach(([v, l], i) => {
  const x = 4.68 + (i % 2) * 1.46, y = yB + 0.42 + Math.floor(i / 2) * 0.5;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.41, h: 0.45, fill: { color: CARD2 }, line: { color: LINE, width: 0.5 }, rectRadius: 0.05 });
  s.addText([{ text: v, options: { bold: true, color: i === 5 ? LIME : MOLTEN, fontSize: 11.5, breakLine: true } }, { text: l, options: { color: DIM, fontSize: 6.3 } }],
    { x, y: y + 0.02, w: 1.41, h: 0.42, fontFace: FONT, align: "center", valign: "middle", margin: 0, isTextBox: true });
});
s.addText("Rollout-simulator output (120 districts) & simulated pilot; planning estimates, not Eurogrip data.", { x: 4.68, y: yB + 1.93, w: 2.9, h: 0.12, fontFace: FONT, fontSize: 5.5, italic: true, color: MUTE, margin: 0, isTextBox: true });

// Feasibility & viability
card(7.75, yB, 2.75, hB);
head(7.87, yB + 0.08, 2.6, "7", "FEASIBILITY & VIABILITY", SKY);
body([
  "**Budget**: ₹25 Cr/yr, inside 1.5–2% of BU revenue; ~₹7.1k per active shop.",
  "**Ops**: runs on existing dealers & field force; ~140 shops/officer.",
  "**Tech**: prototype live today; pilot in 8 weeks.",
  "**Sustained**: tool EMI, tier upkeep, quests, streaks, repeat customers & credit keep shops active.",
  "**Self-funding**: Fleet Pit Pass fees & Ghost Shelf sales offset cost; ROI ≈ " + sim.roi_x + "× gross profit.",
  "**Risks handled**: fraud rules, earn caps, DPDP-2023 privacy.",
], 7.83, yB + 0.4, 2.62, hB - 0.42, { size: 7.1 });

// Measurement
card(10.6, yB, 2.53, hB);
head(10.72, yB + 0.08, 2.4, "8", "MEASURABILITY", VIOLET);
body([
  "**Every reward = a verified event** (single-use tyre QR, dealer-bound codes).",
  "**Guild Score 0–1000**: fitments 30 · referrals 30 · rating 15 · skills 15 · streak 10.",
  "**Lift Engine**: pilot vs matched control districts (diff-in-diff).",
  "**Influence Graph** finds who sells · **Fraud Guard** checks scans · **Nudge Engine** flags drift · **Autopilot** moves spend.",
  "**Mystery-rider audits** measure the recommendation itself.",
], 10.66, yB + 0.4, 2.42, hB - 0.42, { size: 7.1 });

// ───────────── ROW C ─────────────
const yC = 5.79, hC = 1.5;
// Tech & architecture
card(0.2, yC, 5.0, hC);
head(0.32, yC + 0.08, 4.8, "9", "TECH STACK & ARCHITECTURE", LIME);
const arch = [["CHANNELS", "WhatsApp Bot · PWA · rider, dealer, field & brand consoles", "1E2A1A"], ["FRONTEND", "Next.js 15 · React 19 · Three.js/R3F · GSAP · Lenis · Tailwind", "2A1E16"],
  ["API", "Python · FastAPI · Pydantic · SQLModel · pytest", "2A2414"], ["SERVICES", "Guild Score · Fraud · Nudge · Coach · TreadLens · Simulator", "1A2230"], ["DATA & OPS", "SQLite → Postgres · Render · Vercel · GitHub", "22202C"]];
arch.forEach(([t, d, f], i) => {
  const y = yC + 0.4 + i * 0.21;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.3, y, w: 4.8, h: 0.19, fill: { color: f }, line: { color: LINE, width: 0.5 }, rectRadius: 0.03 });
  s.addText([{ text: t + "  ", options: { bold: true, color: LIME, fontSize: 6.8 } }, { text: d, options: { color: WHITE, fontSize: 6.8 } }],
    { x: 0.38, y, w: 4.7, h: 0.19, fontFace: FONT, valign: "middle", margin: 0, isTextBox: true });
});

// Budget split
card(5.3, yC, 3.6, hC);
head(5.42, yC + 0.08, 3.4, "10", "BUDGET · ₹25 Cr / YEAR", AMBER);
const mix = [["Tools", 40, MOLTEN], ["Visibility", 22, AMBER], ["Field", 18, SKY], ["Academy", 10, LIME], ["Tech", 10, VIOLET]];
let bx = 5.4;
mix.forEach(([n, v, c]) => {
  const w = 3.4 * v / 100;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: yC + 0.45, w, h: 0.36, fill: { color: c }, line: { color: CARD, width: 0.75 } });
  s.addText([{ text: v + "%", options: { bold: true, fontSize: 8, breakLine: true } }, { text: n, options: { fontSize: 5.8 } }],
    { x: bx, y: yC + 0.45, w, h: 0.36, fontFace: FONT, color: BG, align: "center", valign: "middle", margin: 0, isTextBox: true });
  bx += w;
});
body(["**72% goes to what shops keep.** **Points ≈ ₹ at bulk price**; never cash · earn caps & expiry bound liability.", "Cost per action: fitment ₹40 · Ghost Shelf ₹48 · referral ₹64 (<5% of a ₹1,450 tyre)."],
  5.38, yC + 0.88, 3.45, 0.6, { size: 6.8, para: 1 });

// Rollout
card(9.0, yC, 4.13, hC);
head(9.12, yC + 0.08, 3.9, "11", "ROLLOUT · 24 MONTHS", ROSE);
const phases = [["M0–2", "Design", "Vendors, NBFC, WhatsApp, dealer brief", "6B7280"], ["M2–6", "Pilot", "10 pilot + 10 control districts", MOLTEN],
  ["M7–12", "Scale", "120 districts · Circles · Fleet Pass", SKY], ["M12–24", "National", "600+ districts · Passport credit", LIME]];
phases.forEach(([t, n, d, c], i) => {
  const x = 9.08 + i * 1.0;
  s.addShape(pres.shapes.CHEVRON, { x, y: yC + 0.43, w: 1.02, h: 0.34, fill: { color: c }, line: { color: c } });
  s.addText([{ text: n, options: { bold: true, fontSize: 7.5, breakLine: true } }, { text: t, options: { fontSize: 6 } }],
    { x: x + 0.12, y: yC + 0.43, w: 0.8, h: 0.34, fontFace: FONT, color: BG, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(d, { x: x + 0.02, y: yC + 0.8, w: 0.96, h: 0.4, fontFace: FONT, fontSize: 6.2, color: DIM, align: "center", valign: "top", margin: 0, isTextBox: true });
});
s.addText("Scale gate: lift ≥ +1.5 pp · fraud < 2% · ≤ ₹350 per extra tyre", { x: 9.1, y: yC + 1.22, w: 3.95, h: 0.2, fontFace: FONT, fontSize: 6.6, bold: true, color: WHITE, align: "center", margin: 0, isTextBox: true });

s.addText("All pilot, district and financial figures come from the prototype's simulator and simulated pilot dataset (planning assumptions in the report), not Eurogrip data.",
  { x: 0.2, y: 7.31, w: 12.93, h: 0.14, fontFace: FONT, fontSize: 5.8, italic: true, color: MUTE, align: "center", margin: 0, isTextBox: true });

s.addNotes("Grip Guild: Tools, Customers, Status. Live demo https://gripguild-outliers.vercel.app/ · Code https://github.com/SDP42/grip-guild · Full 32-page report linked in the header.");

const out = path.resolve(__dirname, "../Grip_Guild_One_Slide_Team_Outliers.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("wrote", out));
