// One-slide executive summary (bright edition) for Eurogrip TORQ 4.0, Team Outliers.
// Fonts: Cambria headings + Calibri body — both ship with every Office install, so it renders identically for judges.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");

const A = (f) => path.resolve(__dirname, "../assets", f);
const sim = JSON.parse(fs.readFileSync(A("sim25.json"), "utf8"));
const DRIVE = process.env.DRIVE_LINK || "link in submission";

const HEAD = "Cambria", BODY = "Calibri";
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
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: line, width: 0.75 }, rectRadius: 0.07 });

const head = (x, y, w, num, text, color) => {
  s.addShape(pres.shapes.OVAL, { x, y: y + 0.03, w: 0.25, h: 0.25, fill: { color } });
  s.addText(num, { x, y: y + 0.03, w: 0.25, h: 0.25, fontFace: BODY, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(text, { x: x + 0.32, y: y - 0.01, w: w - 0.32, h: 0.33, fontFace: HEAD, fontSize: 13, bold: true, color, margin: 0, valign: "middle", isTextBox: true });
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

// ═══════════ HEADER ═══════════
s.addText([{ text: "Grip", options: { color: INK } }, { text: "Guild", options: { color: OR } }],
  { x: 0.25, y: 0.12, w: 2.5, h: 0.62, fontFace: HEAD, fontSize: 36, bold: true, margin: 0, isTextBox: true });
s.addText("Tools · Customers · Status", { x: 0.27, y: 0.72, w: 2.6, h: 0.26, fontFace: BODY, fontSize: 12, bold: true, color: ORD, margin: 0, isTextBox: true });
s.addText([
  { text: "We don't pay mechanics. We make them more successful.", options: { fontFace: HEAD, bold: true, color: INK, fontSize: 15, breakLine: true } },
  { text: "A WhatsApp-first guild that turns India's two-wheeler mechanics and puncture shops into lasting, measurable Eurogrip advocates. They earn ", options: { color: TXT, fontSize: 10 } },
  { text: "tools they own, customers they keep and status riders can see", options: { color: ORD, fontSize: 10, bold: true } },
  { text: ", never cash.  Eurogrip TORQ Challenge 4.0 · Case Study 4: mechanic & puncture-shop advocacy.", options: { color: TXT, fontSize: 10 } },
], { x: 2.95, y: 0.13, w: 6.35, h: 0.86, fontFace: BODY, valign: "middle", margin: 0, isTextBox: true });

card(9.42, 0.12, 3.68, 0.9, "FAFAFA");
s.addImage({ path: A("qr_live.png"), x: 9.5, y: 0.17, w: 0.8, h: 0.8 });
s.addText([
  { text: "Team Outliers", options: { fontFace: HEAD, bold: true, color: OR, fontSize: 11.5, breakLine: true } },
  { text: "Swayam Panchal · Rishit Lahoti · Jeevesh Bodhani", options: { bold: true, color: INK, fontSize: 8.3, breakLine: true } },
  { text: "AI & Data Science, Dwarkadas J. Sanghvi College of Engg.", options: { color: MUTED, fontSize: 7.6, breakLine: true } },
  { text: "Live demo  ", options: { color: MUTED, fontSize: 7.6 } }, { text: "gripguild-outliers.vercel.app", options: { color: "0369A1", fontSize: 7.6, bold: true, hyperlink: { url: "https://gripguild-outliers.vercel.app/" }, breakLine: true } },
  { text: "Source  ", options: { color: MUTED, fontSize: 7.6 } }, { text: "github.com/SDP42/grip-guild", options: { color: "0369A1", fontSize: 7.6, bold: true, hyperlink: { url: "https://github.com/SDP42/grip-guild" }, breakLine: true } },
  { text: "32-page report (PDF)  ", options: { color: MUTED, fontSize: 7.6 } }, { text: DRIVE, options: { color: "0369A1", fontSize: 7.6, bold: true, ...(DRIVE.startsWith("http") ? { hyperlink: { url: DRIVE } } : {}) } },
], { x: 10.36, y: 0.14, w: 2.72, h: 0.86, fontFace: BODY, valign: "middle", margin: 0, isTextBox: true });

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
  "**Scale:** lakhs of fragmented, low-digital shops; field teams can't visit all.",
], 0.3, yA + 0.42, 2.9, hA - 0.46, { size: 7.8, para: 2 });

// 2 Who it's for
card(3.35, yA, 2.55, hA, T.sky[0]);
head(3.47, yA + 0.07, 2.4, "2", "Who it's for", T.sky[1]);
const who = [
  ["Ravi", "puncture shop, no Eurogrip stock"], ["Gurpreet", "Grandmaster garage, Circle mentor"], ["Imran", "new Apprentice, day 6"],
  ["Lakshmi", "EV-scooter specialist"], ["Priya", "gig rider with a flat tyre"], ["Dealer", "redeems codes, ships Ghost Shelf"],
  ["Anita", "field officer, 140 shops"], ["Brand team", "funnel, lift, fraud, budget"],
];
who.forEach(([n, d], i) => {
  const y = yA + 0.44 + i * 0.208;
  s.addShape(pres.shapes.OVAL, { x: 3.45, y: y + 0.015, w: 0.17, h: 0.17, fill: { color: i < 4 ? OR : i === 4 ? "0EA5E9" : i < 7 ? "7C3AED" : INK } });
  s.addText([{ text: n + "  ", options: { bold: true, color: INK } }, { text: d, options: { color: TXT } }],
    { x: 3.68, y, w: 2.2, h: 0.2, fontFace: BODY, fontSize: 8, valign: "middle", margin: 0, isTextBox: true });
});

// 3 Solution
card(6.0, yA, 4.2, hA, T.orange[0]);
head(6.12, yA + 0.07, 4.0, "3", "Our solution: 3 pillars, 22 features", T.orange[1]);
const pillars = [
  ["Tools", "grow the workshop", "C2410C", ["**Fitments Pay Off Your Tools:** half of each fitment's points repay a machine the shop will own", "**Starter kit · Tool Store · Circle Tool Pools**"]],
  ["Customers", "fill the workshop", "3F6212", ["**Puncture SOS** leads", "**Customer Boomerang** reminders", "**Ghost Shelf:** sell with zero stock, dealer delivers in 2–6 h", "**Fleet Pit Pass**"]],
  ["Status", "be the master", "B45309", ["**Apprentice → Grandmaster**", "**Living Shop Board** with verify-QR & ratings", "**Academy** badges", "**Guild Passport** credit"]],
];
pillars.forEach(([t, sub, c, items], i) => {
  const x = 6.1 + i * 1.37;
  card(x, yA + 0.42, 1.31, 1.28, "FFFFFF", "F1D4C4");
  s.addText([{ text: t, options: { fontFace: HEAD, bold: true, color: c, fontSize: 11.5, breakLine: true } }, { text: sub, options: { fontFace: BODY, color: MUTED, fontSize: 7, italic: true } }],
    { x: x + 0.07, y: yA + 0.45, w: 1.2, h: 0.36, margin: 0, isTextBox: true });
  body(items, x + 0.04, yA + 0.82, 1.25, 0.88, { size: 7.1, para: 1 });
});
body([
  "**WhatsApp-first Guild Bot** (no install) · **Tyre Twin 3D** digital record of every fitted tyre · **Guild Coach** daily plan · **TreadLens** health cards · **Quests** · **Circles**",
], 6.1, yA + 1.74, 4.05, 0.4, { size: 7.4, para: 0 });

// 4 Unique
card(10.3, yA, 2.8, hA, T.lime[0]);
head(10.42, yA + 0.07, 2.6, "4", "Why it's unique", T.lime[1]);
body([
  "**Influence without inventory:** referral codes (80 pts) & Ghost Shelf reward the word, not the warehouse.",
  "**Advocacy pays for owned tools,** so shops stay for months, not days.",
  "**The brand sends customers,** not cash.",
  "**A digital twin of every tyre** closes the rider-data gap and fights counterfeits.",
  "**Spend follows proven lift** (Lift Engine + Autopilot).",
  "**Riders win too:** SOS rescue, health cards, genuine-tyre check.",
], 10.38, yA + 0.42, 2.66, hA - 0.46, { size: 8 });

// ═══════════ ROW B ═══════════
const yB = 3.36, hB = 1.98;
// 5 How it works
card(0.2, yB, 5.7, hB, T.slate[0]);
head(0.32, yB + 0.07, 5.5, "5", "How it works: one fitment, six wins", T.slate[1]);
const steps = [
  ["Rider walks in", "or arrives via Puncture SOS"], ["TreadLens check", "health card on WhatsApp"], ["Fit or refer", "stock, Ghost Shelf or code"],
  ["Verified scan", "Fraud Guard; +50–80 pts"], ["Tool EMI moves", "half the points to the machine"], ["Rider returns", "Boomerang · Twin · lift data"],
];
steps.forEach(([t, d], i) => {
  const x = 0.3 + i * 0.93;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: yB + 0.45, w: 0.86, h: 0.95, fill: { color: "FFFFFF" }, line: { color: LINE, width: 0.75 }, rectRadius: 0.06 });
  s.addShape(pres.shapes.OVAL, { x: x + 0.29, y: yB + 0.5, w: 0.28, h: 0.28, fill: { color: [OR, "0EA5E9", "B45309", "7C3AED", "3F6212", "BE123C"][i] } });
  s.addText(String(i + 1), { x: x + 0.29, y: yB + 0.5, w: 0.28, h: 0.28, fontFace: BODY, fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText([{ text: t, options: { bold: true, color: INK, fontSize: 7.8, breakLine: true } }, { text: d, options: { color: MUTED, fontSize: 6.8 } }],
    { x: x + 0.03, y: yB + 0.8, w: 0.8, h: 0.58, fontFace: BODY, align: "center", valign: "top", margin: 0, isTextBox: true });
  if (i < 5) s.addText("›", { x: x + 0.84, y: yB + 0.75, w: 0.1, h: 0.3, fontFace: BODY, fontSize: 14, bold: true, color: "9CA3AF", align: "center", margin: 0, isTextBox: true });
});
body(["**Live cross-persona sync:** rider SOS → mechanic inbox → accept → rider sees ETA; dealer redeems → mechanic notified; every action feeds the Command Centre."],
  0.3, yB + 1.48, 5.5, 0.46, { size: 7.6, para: 0 });

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
  s.addText([{ text: v, options: { fontFace: HEAD, bold: true, color: i === 5 ? "3F6212" : ORD, fontSize: 13, breakLine: true } }, { text: l, options: { fontFace: BODY, color: MUTED, fontSize: 6.8 } }],
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
body([
  "**₹25 Cr/yr,** inside 1.5–2% of BU revenue; ~₹7.1k per active shop.",
  "**Runs on existing** dealers & field force (~140 shops/officer).",
  "**Prototype live today;** pilot in 8 weeks, 10 vs 10 districts.",
  "**Sustained by** tool EMI, tier upkeep, quests, repeat customers, credit.",
  "**Self-funding:** Fleet Pass fees & Ghost Shelf sales; ROI ≈ " + sim.roi_x + "× gross profit.",
  "**Risks handled:** fraud rules, earn caps, DPDP-2023 privacy.",
], 4.13, yC + 0.42, 2.87, hC - 0.45, { size: 7.7 });

// 10 Measurability
card(7.15, yC, 2.55, hC, T.violet[0]);
head(7.27, yC + 0.07, 2.4, "10", "Measurability", T.violet[1]);
body([
  "**Every reward is a verified event:** single-use tyre QR, dealer-bound codes.",
  "**Guild Score 0–1000** per shop.",
  "**Lift Engine:** pilot vs matched control districts (diff-in-diff).",
  "**Influence Graph · Fraud Guard · Nudge Engine · Budget Autopilot · mystery-rider audits.**",
  "**Command Centre** shows funnel, lift & fraud live.",
], 7.23, yC + 0.42, 2.42, hC - 0.45, { size: 7.7 });

// 11 Tech, budget & rollout
card(9.8, yC, 3.3, hC, "F3F6FB");
head(9.92, yC + 0.07, 3.15, "11", "Tech, budget & rollout", "1E3A8A");
body([
  "**Stack:** Next.js 15 · React 19 · Three.js · GSAP · FastAPI · SQLModel · Postgres-ready · Render + Vercel.",
  "**Architecture:** WhatsApp & web channels → API → scoring, fraud, nudge & lift services → data.",
], 9.88, yC + 0.42, 3.17, 0.66, { size: 7.3, para: 1.5 });
const mix = [["Tools 40%", 40, "E8501A"], ["Visibility 22%", 22, "F59E0B"], ["Field 18%", 18, "0EA5E9"], ["Acad. 10", 10, "65A30D"], ["Tech 10", 10, "7C3AED"]];
let bx = 9.9;
mix.forEach(([n, v, c]) => {
  const w = 3.1 * v / 100;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: yC + 1.1, w, h: 0.24, fill: { color: c }, line: { color: "FFFFFF", width: 0.75 } });
  s.addText(n, { x: bx, y: yC + 1.1, w, h: 0.24, fontFace: BODY, fontSize: 6.3, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  bx += w;
});
body(["**Rollout:** design M0–2 → pilot M2–6 → 120 districts by M12 → 600+ by M24. Scale only if lift ≥ +1.5 pp, fraud < 2%."],
  9.88, yC + 1.39, 3.17, 0.46, { size: 7.3, para: 0 });

s.addText("All pilot, district and financial figures come from our rollout simulator and simulated pilot dataset (assumptions in the report), not Eurogrip data.",
  { x: 0.2, y: 7.33, w: 12.9, h: 0.14, fontFace: BODY, fontSize: 6.5, italic: true, color: MUTED, align: "center", margin: 0, isTextBox: true });

s.addNotes("Grip Guild: Tools, Customers, Status. Live demo https://gripguild-outliers.vercel.app/ · Code https://github.com/SDP42/grip-guild · Full 32-page report linked in the header.");

const out = path.resolve(__dirname, "../Grip_Guild_One_Slide_Team_Outliers.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("wrote", out));
