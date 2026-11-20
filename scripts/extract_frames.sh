#!/usr/bin/env bash
# Turn a licensed video clip into a scroll-scrubbed frame sequence for the landing page.
# Usage: scripts/extract_frames.sh <input.mp4> <name> [fps=24] [width=1600] [seconds=6]
set -euo pipefail
IN="$1"; NAME="$2"; FPS="${3:-24}"; WIDTH="${4:-1600}"; SECS="${5:-6}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/frontend/public/frames/$NAME"
rm -rf "$OUT" && mkdir -p "$OUT"
ffmpeg -loglevel error -i "$IN" -t "$SECS" -vf "fps=$FPS,scale=$WIDTH:-2" -c:v libwebp -quality 72 "$OUT/%04d.webp"
COUNT=$(ls "$OUT"/*.webp | wc -l | tr -d ' ')
read -r W H < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=' ':p=0 "$OUT/0001.webp")
printf '{"count": %s, "ext": "webp", "width": %s, "height": %s}\n' "$COUNT" "$W" "$H" > "$OUT/manifest.json"
du -sh "$OUT" | awk -v n="$COUNT" '{print "Wrote " n " frames (" $1 ") to '"$OUT"'"}'
