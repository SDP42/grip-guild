// One-slide executive summary (bright edition) for Eurogrip TORQ 4.0, Team Outliers.
// Fonts: Cambria headings + Calibri body — both ship with every Office install, so it renders identically for judges.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");

const A = (f) => path.resolve(__dirname, "../assets", f);
const sim = JSON.parse(fs.readFileSync(A("sim25.json"), "utf8"));
const DRIVE = process.env.DRIVE_LINK || "https://drive.google.com/drive/folders/1y3CwxZwPbKbKhR09tnwBmrJtDpg8GiOU?usp=sharing";

const QA = !!process.env.QA;
const HEAD = QA ? "Arial" : "Century Gothic", BODY = "Calibri";
const hs = (n) => QA ? +(n * 1.15).toFixed(1) : n; // QA: Arial at 115% ≈ Century Gothic width
const INK = "16181D", TXT = "2B2F36", MUTED = "5B616B", LINE = "E3E5E8", BG = "FFFFFF";
const OR = "E8501A", ORD = "B93C0F";
const T = { // section tints: [fill, heading colour]
  rose: ["FFF1F2", "BE123C"], sky: ["EFF8FF", "0369A1"], orange: ["FFF4EC", "C2410C"], lime: ["F4FBE8", "3F6212"],
  violet: ["F5F3FF", "6D28D9"], amber: ["FFF8E6", "B45309"], slate: ["F4F5F7", "334155"], teal: ["ECFDF8", "0F766E"],
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.title = "Grip Guild — Executive Summary";
pres.author = "Team Outliers";
pres.company = "Dwarkadas J. Sanghvi College of Engineering";
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

const s = pres.addSlide();
s.background = { color: BG };

const card = (x, y, w, h, fill, line = LINE) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: line, width: 0.75 }, rectRadius: 0.07,
    shadow: { type: "outer", blur: 5, offset: 1.5, angle: 90, color: "1F2937", opacity: 0.14 } });

const head = (x, y, w, num, text, color) => {
  s.addShape(pres.shapes.OVAL, { x, y: y + 0.03, w: 0.25, h: 0.25, fill: { color } });
  s.addText(num, { x, y: y + 0.03, w: 0.25, h: 0.25, fontFace: BODY, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(text, { x: x + 0.32, y: y - 0.01, w: w - 0.32, h: 0.33, fontFace: HEAD, fontSize: hs(12), bold: true, color, margin: 0, valign: "middle", isTextBox: true });
};

const rich = (items, { size = 8.5, color = TXT, boldColor = INK, para = 2.5 } = {}) => {
  const out = [];
  items.forEach((it, i) => {
    const parts = it.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    parts.forEach((p, j) => {
      const bold = p.startsWith("**");
      out.push({ text: bold ? p.slice(2, -2) : p, options: { fontFace: BODY, fontSize: size, bold, color: bold ? boldColor : color,
        paraSpaceAfter: j === parts.length - 1 ? para : 0, breakLine: j === parts.length - 1 && i < items.length - 1 } });
    });
  });
  return out;
};
const body = (items, x, y, w, h, opt = {}) => s.addText(rich(items, opt), { x, y, w, h, valign: "top", margin: [0, 2, 0, 2], isTextBox: true, fit: "none" });

// compact table: rows[0] = header; heads = [headFill, headColor]
const mini = (rows, x, y, w, colW, rowH, headFill, headColor, size = 6.8, border = "E5E7EB") =>
  s.addTable(rows.map((r, i) => r.map((c, j) => {
    const parts = String(c || " ").split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return { text: parts.map((t) => ({ text: t.startsWith("**") ? t.slice(2, -2) : t, options: { bold: i === 0 || j === 0 || t.startsWith("**") } })), options: {
      fontFace: BODY, fontSize: i === 0 ? size + 0.3 : size, color: i === 0 ? headColor : j === 0 ? INK : TXT,
      fill: { color: i === 0 ? headFill : "FFFFFF" }, margin: [1, 3, 1, 3], valign: "middle" } };
  })), { x, y, w, colW, rowH, border: { type: "solid", pt: 0.5, color: border } });

// ═══════════ HEADER ═══════════
s.addText([{ text: "Grip", options: { color: INK } }, { text: "Guild", options: { color: OR } }],
  { x: 0.25, y: 0.12, w: 2.5, h: 0.62, fontFace: HEAD, fontSize: hs(32), bold: true, margin: 0, isTextBox: true });
s.addText("Tools · Customers · Status", { x: 0.27, y: 0.72, w: 2.6, h: 0.26, fontFace: BODY, fontSize: 12, bold: true, color: ORD, margin: 0, isTextBox: true });
s.addText([
  { text: "We don't pay mechanics. We make them more successful.", options: { fontFace: HEAD, bold: true, color: INK, fontSize: hs(11.5), breakLine: true } },
  { text: "A WhatsApp-first guild that turns India's two-wheeler mechanics and puncture shops into lasting, measurable Eurogrip advocates. They earn ", options: { color: TXT, fontSize: 10 } },
  { text: "tools they own, customers they keep and status riders can see", options: { color: ORD, fontSize: 10, bold: true } },
  { text: ", never cash.  Eurogrip TORQ Challenge 4.0 · Case Study 4: mechanic & puncture-shop advocacy.", options: { color: TXT, fontSize: 10 } },
], { x: 2.95, y: 0.13, w: 5.8, h: 0.86, fontFace: BODY, valign: "middle", margin: 0, isTextBox: true });

card(8.9, 0.1, 4.2, 0.94, "FAFAFA");
s.addImage({ path: A("qr_live.png"), x: 8.98, y: 0.15, w: 0.68, h: 0.68, hyperlink: { url: "https://gripguild-outliers.vercel.app/" } });
s.addImage({ path: A("qr_drive.png"), x: 9.7, y: 0.15, w: 0.68, h: 0.68, hyperlink: { url: DRIVE } });
s.addText("Live demo", { x: 8.96, y: 0.84, w: 0.72, h: 0.16, fontFace: BODY, fontSize: 6.2, bold: true, color: OR, align: "center", margin: 0, isTextBox: true });
s.addText("Report & video", { x: 9.66, y: 0.84, w: 0.76, h: 0.16, fontFace: BODY, fontSize: 6.2, bold: true, color: "0369A1", align: "center", margin: 0, isTextBox: true });
s.addText([
  { text: "Team Outliers", options: { fontFace: HEAD, bold: true, color: OR, fontSize: hs(10.5), breakLine: true } },
  { text: "Swayam Panchal · Rishit Lahoti · Jeevesh Bodhani", options: { bold: true, color: INK, fontSize: 8.3, breakLine: true } },
  { text: "AI & Data Science, Dwarkadas J. Sanghvi College of Engg.", options: { color: MUTED, fontSize: 7.6, breakLine: true } },
  { text: "Live demo  ", options: { color: MUTED, fontSize: 7.6 } }, { text: "gripguild-outliers.vercel.app", options: { color: "0369A1", fontSize: 7.6, bold: true, hyperlink: { url: "https://gripguild-outliers.vercel.app/" }, breakLine: true } },
  { text: "Source  ", options: { color: MUTED, fontSize: 7.6 } }, { text: "github.com/SDP42/grip-guild", options: { color: "0369A1", fontSize: 7.6, bold: true, hyperlink: { url: "https://github.com/SDP42/grip-guild" }, breakLine: true } },
  { text: "Report, deck & video  ", options: { color: MUTED, fontSize: 7.6 } }, { text: "Google Drive folder ↗", options: { color: "0369A1", fontSize: 7.6, bold: true, hyperlink: { url: DRIVE } } },
], { x: 10.48, y: 0.13, w: 2.6, h: 0.88, fontFace: BODY, valign: "middle", margin: 0, isTextBox: true });

// ═══════════ ROW A ═══════════
const yA = 1.12, hA = 2.16;
// 1 Problem
card(0.2, yA, 3.05, hA, T.rose[0]);
head(0.32, yA + 0.07, 2.9, "1", "The problem", T.rose[1]);
body([
  "**The mechanic decides the tyre:** riders ask the nearest puncture shop \"which tyre?\" and follow the answer.",
  "**Lukewarm awareness:** mechanics know Eurogrip but rarely recommend it.",
  "**Stocking lags** competitors, and shops recommend what is on their shelf.",
  "**Tools > cash** is mechanics' #1 ask; cash schemes fade.",
  "**Status matters:** demand for boards & uniforms is rising fast.",
  "**Non-stockers already advocate,** yet nothing rewards it.",
  "**Blind spot:** no data on who rides Eurogrip tyres.",
  "**Scale:** fragmented, low-digital shops nationwide.",
], 0.3, yA + 0.42, 2.9, hA - 0.46, { size: 7.8, para: 2 });

// 2 Who it's for
card(3.35, yA, 2.55, hA, T.sky[0]);
head(3.47, yA + 0.07, 2.4, "2", "Who it's for", T.sky[1]);
mini([["Persona", "Pain today", "Guild gives"],
  ["Ravi", "no Eurogrip stock", "Ghost Shelf · referrals"],
  ["Gurpreet", "no recognition", "Grandmaster board"],
  ["Imran", "few customers", "starter kit · Academy"],
  ["Lakshmi", "EV skills, capital", "EV quest · credit"],
  ["Priya", "flat mid-shift", "SOS · Pit Pass"],
  ["Dealer", "can't reach shops", "code & order sales"],
  ["Anita", "140 shops to cover", "Nudge priorities"],
  ["Brand", "can't prove ROI", "Lift · Autopilot"]],
  3.43, yA + 0.42, 2.4, [0.56, 0.86, 0.98], 0.188, "DCEFFC", "0369A1", 6.6, "CFE6F7");

// 3 Solution
card(6.0, yA, 4.2, hA, T.orange[0]);
head(6.12, yA + 0.07, 4.0, "3", "Our solution: 3 pillars, 22 features", T.orange[1]);
const pillars = [
  ["Tools", "grow the workshop", "C2410C", ["**Fitments pay off tools:** ½ of points repay a machine he'll own", "**Starter kit** day 1 · **Tool Store** ~20% < MRP · **Circle Pools**"],
    "an asset he keeps, not cash he spends", "FFF1E8"],
  ["Customers", "fill the workshop", "3F6212", ["**Puncture SOS** leads · **Boomerang** reminders", "**Ghost Shelf:** sell with zero stock, dealer ships in 2–6 h", "**Fleet Pit Pass** volume"],
    "the brand sends footfall, not discounts", "EEF7E0"],
  ["Status", "be the master", "B45309", ["**Apprentice → Grandmaster**", "**Living Shop Board:** riders rate", "**Academy** · **Passport** credit", "**Tier perks:** priority SOS leads, better tool rates"],
    "pride riders can see and trust", "FFF5DC"],
];
pillars.forEach(([t, sub, c, items, why, wf], i) => {
  const x = 6.1 + i * 1.37;
  card(x, yA + 0.42, 1.31, 1.36, "FFFFFF", "F1D4C4");
  s.addText([{ text: t, options: { fontFace: HEAD, bold: true, color: c, fontSize: hs(10.5), breakLine: true } }, { text: sub, options: { fontFace: BODY, color: MUTED, fontSize: 6.8, italic: true } }],
    { x: x + 0.07, y: yA + 0.45, w: 1.2, h: 0.32, margin: 0, isTextBox: true });
  body(items, x + 0.04, yA + 0.77, 1.25, 0.66, { size: 6.7, para: 1 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.05, y: yA + 1.43, w: 1.21, h: 0.31, fill: { color: wf }, line: { color: wf }, rectRadius: 0.04 });
  s.addText([{ text: "Better: ", options: { bold: true, color: c } }, { text: why, options: { color: INK } }],
    { x: x + 0.08, y: yA + 1.43, w: 1.16, h: 0.31, fontFace: BODY, fontSize: 6.5, valign: "middle", margin: 0, isTextBox: true });
});
body([
  "**Why ours wins:** rivals pay per purchase; we reward **influence**, build **owned assets** & send **customers**, proven vs control. **Plus:** Guild Bot · Tyre Twin 3D · Coach · TreadLens · Quests · Circles.",
], 6.1, yA + 1.81, 4.05, 0.3, { size: 6.5, para: 0 });

// 4 Unique
card(10.3, yA, 2.8, hA, T.lime[0]);
head(10.42, yA + 0.07, 2.6, "4", "Why it's unique", T.lime[1]);
mini([["", "Typical cash / QR scheme", "Grip Guild"],
  ["Rewards", "a purchase", "**influence too** (codes, SOS)"],
  ["Currency", "cash that fades", "**owned tools**, customers"],
  ["Stock", "must stock to earn", "**Ghost Shelf**: zero stock"],
  ["Rider", "nothing", "**SOS, health cards, twin**"],
  ["Proof", "counts scans", "**lift vs control**"],
  ["Data", "pack level", "**tyre & rider level**"],
  ["Channel", "separate app", "**WhatsApp-first**"]],
  10.38, yA + 0.42, 2.64, [0.5, 0.94, 1.2], 0.205, "E3F4C8", "3F6212", 6.7, "D3E8B4");

// ═══════════ ROW B ═══════════
const yB = 3.36, hB = 1.98;
// 5 How it works
card(0.2, yB, 5.7, hB, T.slate[0]);
head(0.32, yB + 0.07, 5.5, "5", "How it works: service blueprint of one fitment", T.slate[1]);
// Service blueprint: chevron stage track + swimlane matrix (who / what / system)
const STAGES = [["Arrive", "C2410C"], ["Diagnose", "D9480F"], ["Fit or refer", "B45309"], ["Verify", "7C3AED"], ["Reward", "3F6212"], ["Retain", "0369A1"]];
const LBL = 0.6, CW = (5.42 - LBL) / 6, X0 = 0.3;
s.addText("STAGE", { x: X0, y: yB + 0.42, w: LBL, h: 0.3, fontFace: BODY, fontSize: 6.5, bold: true, color: MUTED, valign: "middle", margin: 0, isTextBox: true });
STAGES.forEach(([n, c], i) => {
  const x = X0 + LBL + i * CW;
  s.addShape(pres.shapes.CHEVRON, { x: x - (i ? 0.04 : 0), y: yB + 0.42, w: CW + 0.06, h: 0.3, fill: { color: c }, line: { color: c } });
  s.addText([{ text: String(i + 1) + "  ", options: { bold: true, color: "FFE7D6" } }, { text: n, options: { bold: true, color: "FFFFFF" } }],
    { x: x + 0.08, y: yB + 0.42, w: CW - 0.12, h: 0.3, fontFace: BODY, fontSize: 7.4, align: "center", valign: "middle", margin: 0, isTextBox: true });
});
mini([
  ["Who", "Rider", "Mechanic", "Mechanic + dealer", "Fraud Guard", "Mechanic", "Rider + brand"],
  ["Does", "walks in or taps Puncture SOS", "20-sec TreadLens check; card on WhatsApp", "stocked, Ghost Shelf order or referral code", "single-use tyre QR: duplicate, speed & geo checks", "+50–80 pts; ½ pays the tool EMI", "Boomerang reminder brings rider back"],
  ["System", "SOS lead → mechanic inbox", "Tyre Twin created", "order → dealer queue", "alert if suspicious", "Guild Score & tier ↑", "lift data → Command Centre"],
].map((r, i) => (i === 0 ? r : r)), X0, yB + 0.76, 5.5, [LBL, CW, CW, CW, CW, CW, CW], 0.22, "F1F3F6", "334155", 6.2, "DDE1E7");
body(["**Points economy:** stocked fitment 50 · Ghost Shelf 60 · referral 80 · SOS rescue 40 · Academy 100–250 · quests 300–500 (never cash)."],
  X0, yB + 1.7, 5.5, 0.25, { size: 7, para: 0 });

// 6 Prototype
card(6.0, yB, 3.6, hB, "F7F8FA");
head(6.12, yB + 0.07, 3.4, "6", "Working prototype (live)", "1F2937");
[["hero.jpg", "3D scroll landing"], ["app_home.jpg", "Mechanic app + Coach"], ["twin_section.jpg", "Tyre Twin 3D explode"], ["command_lower.jpg", "Command Centre"]].forEach(([f, cap], i) => {
  const x = 6.1 + i * 0.86;
  s.addImage({ path: A("screens/" + f), x, y: yB + 0.45, w: 0.82, h: 1.12, sizing: { type: "cover", w: 0.82, h: 1.12 } });
  s.addText(cap, { x: x - 0.02, y: yB + 1.59, w: 0.86, h: 0.2, fontFace: BODY, fontSize: 6.4, color: MUTED, align: "center", margin: 0, isTextBox: true });
});
s.addText("FastAPI + Next.js · ~45 APIs · 8 playable personas · responsive · deployed", { x: 6.1, y: yB + 1.78, w: 3.45, h: 0.16, fontFace: BODY, fontSize: 7, bold: true, color: INK, align: "center", margin: 0, isTextBox: true });

// 7 Impact
card(9.7, yB, 3.4, hB, T.orange[0]);
head(9.82, yB + 0.07, 3.2, "7", "Impact: year 1 at ₹25 Cr", T.orange[1]);
const fmt = (n) => n.toLocaleString("en-IN");
[[fmt(sim.enrolled), "shops enrolled"], [fmt(sim.active), "active every month"], [(sim.incremental_tyres / 1e5).toFixed(1) + " lakh", "incremental tyres"],
  ["₹" + Math.round(sim.incremental_revenue_cr) + " Cr", "incremental revenue"], ["₹" + sim.cost_per_incremental_tyre_inr, "cost per extra tyre"], ["+3.75 pp", "share lift vs control"]].forEach(([v, l], i) => {
  const x = 9.78 + (i % 3) * 1.09, y = yB + 0.45 + Math.floor(i / 3) * 0.68;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.04, h: 0.62, fill: { color: "FFFFFF" }, line: { color: "F1D4C4", width: 0.75 }, rectRadius: 0.05 });
  s.addText([{ text: v, options: { fontFace: HEAD, bold: true, color: i === 5 ? "3F6212" : ORD, fontSize: hs(12), breakLine: true } }, { text: l, options: { fontFace: BODY, color: MUTED, fontSize: 6.8 } }],
    { x, y: y + 0.03, w: 1.04, h: 0.57, align: "center", valign: "middle", margin: 0, isTextBox: true });
});
s.addText("Simulator output (120 districts) & simulated pilot: planning estimates, not Eurogrip data.", { x: 9.78, y: yB + 1.8, w: 3.27, h: 0.15, fontFace: BODY, fontSize: 6.2, italic: true, color: MUTED, margin: 0, isTextBox: true });

// ═══════════ ROW C ═══════════
const yC = 5.42, hC = 1.88;
// 8 Before vs after
card(0.2, yC, 3.75, hC, T.amber[0]);
head(0.32, yC + 0.07, 3.6, "8", "Before vs after", T.amber[1]);
const ba = [["", "Before", "With Grip Guild"],
  ["Mechanic", "Sells what's stocked; schemes fade", "Sells with no stock; owns tools; gets leads"],
  ["Rider", "Stranded; can't judge shops", "SOS in minutes; verified boards"],
  ["Dealer", "Can't reach non-stockers", "New sales via codes & Ghost Shelf"],
  ["Eurogrip", "Spend unproven; no rider data", "Measured lift; tyre-level data"]];
s.addTable(ba.map((r, i) => r.map((c, j) => ({ text: c, options: {
  fontFace: BODY, fontSize: i === 0 ? 7.6 : 7.1, bold: i === 0 || j === 0, color: i === 0 ? (j === 2 ? "3F6212" : j === 1 ? "BE123C" : MUTED) : j === 0 ? INK : TXT,
  fill: { color: i === 0 ? "FFF0CC" : "FFFFFF" }, margin: [1.5, 3, 1.5, 3], valign: "middle" } }))),
  { x: 0.3, y: yC + 0.42, w: 3.56, colW: [0.66, 1.35, 1.55], rowH: 0.27, border: { type: "solid", pt: 0.5, color: "EADFC8" } });

// 9 Feasibility & viability
card(4.05, yC, 3.0, hC, T.teal[0]);
head(4.17, yC + 0.07, 2.85, "9", "Feasibility & viability", T.teal[1]);
mini([["Lens", "Verdict", "Evidence"],
  ["Financial", "✓ ₹25 Cr/yr", "1.5–2% of BU; ~₹7.1k / active shop"],
  ["Operational", "✓ High", "existing dealers; ~140 shops/officer"],
  ["Technical", "✓ Live", "deployed prototype, ~45 APIs, tests"],
  ["Time", "✓ 8 weeks", "pilot: 10 vs 10 districts"],
  ["Sustained", "✓ Yes", "tool EMI, tiers, quests, repeat riders"],
  ["Self-funding", "✓ " + sim.roi_x + "× ROI", "Fleet Pass fees, Ghost Shelf sales"],
  ["Risk", "✓ Managed", "fraud rules, earn caps, DPDP 2023"]],
  4.12, yC + 0.42, 2.86, [0.66, 0.68, 1.52], 0.178, "CCF3E6", "0F766E", 6.6, "B9E8D7");

// 10 Measurability
card(7.15, yC, 2.55, hC, T.violet[0]);
head(7.27, yC + 0.07, 2.4, "10", "Measurability", T.violet[1]);
s.addText("Guild Score 0–1000 per shop", { x: 7.25, y: yC + 0.4, w: 2.35, h: 0.15, fontFace: BODY, fontSize: 7, bold: true, color: INK, margin: 0, isTextBox: true });
let gx = 7.25;
[["Fitments 30", 30, "E8501A"], ["Referrals 30", 30, "65A30D"], ["Rating 15", 15, "F59E0B"], ["Skills 15", 15, "7C3AED"], ["Streak", 10, "0EA5E9"]].forEach(([n, v, c]) => {
  const w = 2.35 * v / 100;
  s.addShape(pres.shapes.RECTANGLE, { x: gx, y: yC + 0.57, w, h: 0.22, fill: { color: c }, line: { color: "FFFFFF", width: 0.75 } });
  s.addText(n, { x: gx, y: yC + 0.57, w, h: 0.22, fontFace: BODY, fontSize: 5.8, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  gx += w;
});
body(["**Verified events** (single-use QR) · **Lift Engine** diff-in-diff · **Fraud Guard · Nudge Engine · mystery-rider audits**."],
  7.23, yC + 0.83, 2.42, 0.3, { size: 6.6, para: 0 });
mini([["KPI (live in Command Centre)", "Pilot target"],
  ["Active shops (30 days)", "≥ 50%"],
  ["Referral → sale", "≥ 45%"],
  ["Share lift vs control", "≥ +1.5 pp"],
  ["Fraud rate", "< 2%"]],
  7.25, yC + 1.15, 2.38, [1.62, 0.76], 0.125, "E9E3FF", "6D28D9", 6.3, "D9D0FA");

// 11 Tech, budget & rollout
card(9.8, yC, 3.3, hC, "F3F6FB");
head(9.92, yC + 0.07, 3.15, "11", "Tech, budget & rollout", "1E3A8A");
const chips = [["WhatsApp\n+ Web", "DCFCE7"], ["Next.js 15\nThree.js", "FFEDD5"], ["FastAPI\n45 APIs", "FEF3C7"], ["Score·Fraud\nNudge·Lift", "E0E7FF"], ["SQLModel\nPostgres", "F1F5F9"]];
chips.forEach(([t, f], i) => {
  const x = 9.9 + i * 0.63;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: yC + 0.42, w: 0.54, h: 0.4, fill: { color: f }, line: { color: "C7CEDB", width: 0.5 }, rectRadius: 0.04 });
  s.addText(t, { x, y: yC + 0.42, w: 0.54, h: 0.4, fontFace: BODY, fontSize: 6, bold: true, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true });
  if (i < 4) s.addText("→", { x: x + 0.53, y: yC + 0.47, w: 0.11, h: 0.28, fontFace: BODY, fontSize: 8, bold: true, color: "64748B", align: "center", margin: 0, isTextBox: true });
});
s.addText("React 19 · GSAP · Lenis · Tailwind · Pydantic · pytest · deployed on Render + Vercel", { x: 9.9, y: yC + 0.85, w: 3.12, h: 0.16, fontFace: BODY, fontSize: 6.6, color: TXT, margin: 0, isTextBox: true });
const mix = [["Tools 40%", 40, "E8501A"], ["Visibility 22%", 22, "F59E0B"], ["Field 18%", 18, "0EA5E9"], ["Acad 10%", 10, "65A30D"], ["Tech 10%", 10, "7C3AED"]];
let bx = 9.9;
mix.forEach(([n, v, c]) => {
  const w = 3.1 * v / 100;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: yC + 1.05, w, h: 0.22, fill: { color: c }, line: { color: "FFFFFF", width: 0.75 } });
  s.addText(n, { x: bx, y: yC + 1.05, w, h: 0.22, fontFace: BODY, fontSize: 5.9, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  bx += w;
});
[["Design", "M0–2", "64748B"], ["Pilot", "M2–6", "E8501A"], ["Scale", "M7–12", "0EA5E9"], ["National", "M12–24", "65A30D"]].forEach(([n, t, c], i) => {
  const x = 9.88 + i * 0.775;
  s.addShape(pres.shapes.CHEVRON, { x, y: yC + 1.33, w: 0.8, h: 0.3, fill: { color: c }, line: { color: c } });
  s.addText([{ text: n, options: { bold: true, breakLine: true } }, { text: t }], { x: x + 0.12, y: yC + 1.33, w: 0.56, h: 0.3, fontFace: BODY, fontSize: 6, lineSpacingMultiple: 0.9, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
});
s.addText("Scale gate: lift ≥ +1.5 pp · fraud < 2% · ≤ ₹350 per extra tyre", { x: 9.9, y: yC + 1.66, w: 3.12, h: 0.16, fontFace: BODY, fontSize: 6.6, bold: true, color: INK, align: "center", margin: 0, isTextBox: true });

s.addText("All pilot, district and financial figures come from our rollout simulator and simulated pilot dataset (assumptions in the report), not Eurogrip data.",
  { x: 0.2, y: 7.33, w: 12.9, h: 0.14, fontFace: BODY, fontSize: 6.5, italic: true, color: MUTED, align: "center", margin: 0, isTextBox: true });

s.addNotes("Grip Guild: Tools, Customers, Status. Live demo https://gripguild-outliers.vercel.app/ · Code https://github.com/SDP42/grip-guild · Full 32-page report linked in the header.");

const out = path.resolve(__dirname, "../Grip_Guild_One_Slide_Team_Outliers.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("wrote", out));
