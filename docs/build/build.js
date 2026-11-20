const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType, PageNumber, LevelFormat, BorderStyle, TabStopType } = require("docx");
const { C, FONT } = require("./lib");
const p1 = require("./part1");
const p2 = require("./part2");
const p3 = require("./part3");
const p4 = require("./part4");

const body = [
  ...p1.control(), ...p1.executive(), ...p1.problem(), ...p1.research(), ...p1.insights(), ...p1.personas(),
  ...p2.solution(), ...p2.features(), ...p2.flows(), ...p2.unique(), ...p2.prototype(),
  ...p3.tech(), ...p3.measurement(), ...p3.budget(), ...p3.rollout(), ...p3.feasibility(), ...p3.impact(), ...p3.risks(), ...p4.dayInGuild(), ...p4.pilot(), ...p4.economy(), ...p4.scorecard(), ...p3.roadmap(), ...p3.appendix(),
];

const page = { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 800, left: 850, right: 850, header: 380, footer: 380 } };

const header = new Header({ children: [new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.molten, space: 4 } },
  tabStops: [{ type: TabStopType.RIGHT, position: 10206 }],
  children: [new TextRun({ text: "GRIP GUILD", font: FONT, bold: true, size: 16, color: C.ink }), new TextRun({ text: "  ·  Eurogrip TORQ Challenge 4.0 · Case Study 4", font: FONT, size: 16, color: C.grey }),
    new TextRun({ text: "\tTeam Outliers · DJSCE (AI & DS)", font: FONT, size: 16, color: C.grey })],
})] });
const footer = new Footer({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: 10206 }],
  children: [new TextRun({ text: "Tools. Customers. Status.  ·  Simulated data clearly labelled", font: FONT, size: 15, color: C.grey }),
    new TextRun({ children: ["\tPage ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], font: FONT, size: 15, color: C.ink, bold: true })],
})] });

const doc = new Document({
  creator: "Team Outliers", title: "Grip Guild — Solution Report", description: "Eurogrip TORQ Challenge 4.0, Case Study 4",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 36, bold: true, color: C.ink }, paragraph: { spacing: { before: 0, after: 160 }, keepNext: true, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: C.molten, space: 6 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 26, bold: true, color: C.molten }, paragraph: { spacing: { before: 200, after: 90 }, keepNext: true, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 21, bold: true, color: C.ink }, paragraph: { spacing: { before: 120, after: 50 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 240 } } } }] },
    { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } } } }] },
  ] },
  sections: [
    { properties: { page: { ...page, margin: { top: 480, bottom: 400, left: 850, right: 850 } } }, children: p1.cover() },
    { properties: { page }, headers: { default: header }, footers: { default: footer }, children: body },
  ],
});

const out = path.resolve(__dirname, "../Grip_Guild_Solution_Report_Team_Outliers.docx");
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log("wrote", out, (b.length / 1e6).toFixed(1) + " MB"); });
