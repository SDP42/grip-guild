// Layout helpers for the Grip Guild report (docx-js).
const fs = require("fs");
const path = require("path");
const {
  Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  HeadingLevel, BorderStyle, VerticalAlign, PageBreak,
} = require("docx");

const ASSETS = path.resolve(__dirname, "../assets");
const C = { molten: "FF5A1F", ink: "111318", amber: "F59E0B", green: "65A30D", sky: "0EA5E9", violet: "8B5CF6", rose: "E11D48", grey: "6B7280", light: "F3F4F6", cream: "FFF7ED", lime: "F7FEE7" };
const FONT = "Arial";
const CONTENT_W = 10206; // A4 width 11906 − 2 × 850 margins (DXA)
const PX_W = 680; // same width in 96-dpi pixels for images

function imgSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  let i = 2;
  while (i < b.length) {
    const len = b.readUInt16BE(i + 2);
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error("size? " + file);
}

const run = (t, o = {}) => new TextRun({ text: t, font: FONT, size: o.size ?? 20, bold: o.bold, italics: o.italic, color: o.color ?? "1F2937" });

// Inline markup: **bold**
function runs(text, o = {}) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((s) =>
    s.startsWith("**") ? run(s.slice(2, -2), { ...o, bold: true, color: o.boldColor ?? o.color ?? C.ink }) : run(s, o));
}

const P = (text, o = {}) => new Paragraph({ children: runs(text, o), alignment: o.align ?? AlignmentType.JUSTIFIED, spacing: { after: o.after ?? 100, line: 264 } });
const TOC_ENTRIES = [];
const H1 = (text, o = {}) => { TOC_ENTRIES.push(text); return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: FONT })], pageBreakBefore: !!o.newPage }); };
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: FONT })] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, font: FONT })] });
const bullet = (text, lvl = 0) => new Paragraph({ numbering: { reference: "bullets", level: lvl }, children: runs(text), spacing: { after: 40, line: 252 } });
const num = (text) => new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: runs(text), spacing: { after: 40, line: 252 } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function image(file, width = PX_W, caption) {
  const full = path.join(ASSETS, file);
  const { w, h } = imgSize(full);
  const out = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: caption ? 20 : 100 },
    children: [new ImageRun({ type: file.endsWith(".png") ? "png" : "jpg", data: fs.readFileSync(full), transformation: { width, height: Math.round((width * h) / w) } })] })];
  if (caption) out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [run(caption, { size: 16, italic: true, color: C.grey })] }));
  return out;
}

const border = (c = "D1D5DB") => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const borders = (c) => ({ top: border(c), bottom: border(c), left: border(c), right: border(c) });
const noBorders = { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } };

function cell(content, width, o = {}) {
  const children = (Array.isArray(content) ? content : [content]).map((c) => (typeof c === "string"
    ? new Paragraph({ children: runs(c, { size: o.size ?? 18, color: o.color, bold: o.bold }), alignment: o.align ?? AlignmentType.LEFT, spacing: { after: 30, line: 240 } })
    : c));
  return new TableCell({ children, width: { size: width, type: WidthType.DXA }, borders: o.noBorder ? noBorders : borders(o.borderColor),
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined, verticalAlign: o.valign ?? VerticalAlign.CENTER,
    margins: { top: o.pad ?? 70, bottom: o.pad ?? 70, left: 110, right: 110 }, columnSpan: o.span });
}

// Data table: rows[0] is the header.
function table(rows, widths, o = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const scale = CONTENT_W / total;
  const w = widths.map((x) => Math.round(x * scale));
  w[w.length - 1] += CONTENT_W - w.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: w,
    rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, children: r.map((c, j) => cell(c, w[j], i === 0
      ? { fill: o.headFill ?? C.ink, color: "FFFFFF", bold: true, size: 17 }
      : { fill: o.zebra !== false && i % 2 === 0 ? "F9FAFB" : undefined, size: o.size ?? 17, bold: o.firstBold && j === 0 })) })),
  });
}

// Coloured callout box (single-cell table)
function callout(title, lines, fill = C.cream, accent = C.molten) {
  const kids = [new Paragraph({ children: [run(title, { bold: true, color: accent, size: 20 })], spacing: { after: 60 } }),
    ...lines.map((l) => new Paragraph({ children: runs(l, { size: 18 }), spacing: { after: 40, line: 252 } }))];
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ children: kids, width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill },
      borders: { top: noBorders.top, bottom: noBorders.bottom, right: noBorders.right, left: { style: BorderStyle.SINGLE, size: 24, color: accent } },
      margins: { top: 120, bottom: 120, left: 200, right: 200 } })] })] });
}

// Row of KPI tiles
function tiles(items, fill = C.ink) {
  const w = Math.floor(CONTENT_W / items.length);
  const widths = items.map((_, i) => (i === items.length - 1 ? CONTENT_W - w * (items.length - 1) : w));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ children: items.map(([v, l], i) => new TableCell({ width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 ? "1F2329" : fill }, borders: noBorders,
      margins: { top: 140, bottom: 140, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(v, { bold: true, size: 30, color: C.molten })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [run(l, { size: 15, color: "E5E7EB" })] })] })) })] });
}

// Image beside text (two columns)
function sideBySide(file, imgWidthPx, paras, imgLeft = true) {
  const imgW = Math.round((imgWidthPx / PX_W) * CONTENT_W);
  const txtW = CONTENT_W - imgW;
  const full = path.join(ASSETS, file);
  const { w, h } = imgSize(full);
  const imgCell = new TableCell({ width: { size: imgW, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: file.endsWith(".png") ? "png" : "jpg", data: fs.readFileSync(full),
      transformation: { width: imgWidthPx - 12, height: Math.round(((imgWidthPx - 12) * h) / w) } })] })] });
  const txtCell = new TableCell({ width: { size: txtW, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 160, right: 80 }, children: paras });
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: imgLeft ? [imgW, txtW] : [txtW, imgW],
    rows: [new TableRow({ children: imgLeft ? [imgCell, txtCell] : [txtCell, imgCell] })] });
}

// Two images side by side
function imagePair(a, b, capA, capB) {
  const half = Math.floor(CONTENT_W / 2);
  const mk = (file, cap, width) => {
    const full = path.join(ASSETS, file);
    const { w, h } = imgSize(full);
    const px = PX_W / 2 - 10;
    return new TableCell({ width: { size: width, type: WidthType.DXA }, borders: noBorders, margins: { top: 40, bottom: 40, left: 40, right: 40 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: file.endsWith(".png") ? "png" : "jpg", data: fs.readFileSync(full),
        transformation: { width: px, height: Math.round((px * h) / w) } })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [run(cap, { size: 15, italic: true, color: C.grey })] })] });
  };
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [half, CONTENT_W - half],
    rows: [new TableRow({ children: [mk(a, capA, half), mk(b, capB, CONTENT_W - half)] })] });
}

const spacer = (after = 80) => new Paragraph({ children: [], spacing: { after } });

module.exports = { TOC_ENTRIES, C, FONT, CONTENT_W, PX_W, run, runs, P, H1, H2, H3, bullet, num, pageBreak, image, table, callout, tiles, sideBySide, imagePair, spacer, cell, noBorders };
