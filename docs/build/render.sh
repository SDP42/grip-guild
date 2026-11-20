#!/usr/bin/env bash
# Build the report, render to PDF, and write toc.json (heading → page) for the next pass.
set -euo pipefail
cd "$(dirname "$0")"
node build.js
SK="/Users/swayampanchal/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/6f0e2a5c-5cca-458a-83e3-1b722001509a/5de387a7-c308-485a-a623-973b75dc3b25/skills/docx"
R="${RENDER_DIR:?set RENDER_DIR}"
mkdir -p "$R"
zip -d ../Grip_Guild_Solution_Report_Team_Outliers.docx '*/' >/dev/null 2>&1 || true
cp ../Grip_Guild_Solution_Report_Team_Outliers.docx "$R/report.docx"
(cd "$R" && python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf report.docx >/dev/null 2>&1)
python3 - "$R/report.pdf" <<'PY'
import json, subprocess, sys
pdf = sys.argv[1]
pages = int([l for l in subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout.splitlines() if l.startswith("Pages")][0].split()[-1])
titles = json.load(open("toc_titles.json"))
found = {}
for p in range(3, pages + 1):
    txt = subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), "-layout", pdf, "-"], capture_output=True, text=True).stdout
    lines = [l.strip() for l in txt.splitlines()]
    for t in titles:
        if t not in found and any(l.startswith(t) for l in lines):
            found[t] = p
json.dump(found, open("toc.json", "w"), indent=1)
print("pages:", pages, "| headings located:", len(found), "/", len(titles))
PY
