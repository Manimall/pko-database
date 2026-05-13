#!/usr/bin/env bash
# Convert all PNG/JPG assets to WebP. Idempotent: re-running is safe.
# Requires `cwebp` (brew install webp) on macOS.
#
# Usage: bash scripts/convert-images-to-webp.sh

set -euo pipefail

cd "$(dirname "$0")/.."

QUALITY=85
PUBLIC_DIR="public"

if ! command -v cwebp >/dev/null; then
  echo "Error: cwebp not found. Install with: brew install webp"
  exit 1
fi

count=0
converted=0
skipped=0

convert_one() {
  local src="$1"
  local dst="${src%.*}.webp"
  count=$((count + 1))
  if [[ -f "$dst" && "$dst" -nt "$src" ]]; then
    skipped=$((skipped + 1))
    return
  fi
  cwebp -quiet -q "$QUALITY" "$src" -o "$dst"
  converted=$((converted + 1))
}

# Logos (440 PNGs)
for f in "$PUBLIC_DIR"/logos/*.png; do
  [[ -f "$f" ]] || continue
  convert_one "$f"
done

# Brand PNGs
for f in "$PUBLIC_DIR"/logo-rvdp.png "$PUBLIC_DIR"/logo-navigator.png; do
  [[ -f "$f" ]] || continue
  convert_one "$f"
done

# Article + hero JPGs
for f in "$PUBLIC_DIR"/images/*.jpg; do
  [[ -f "$f" ]] || continue
  convert_one "$f"
done

echo "Processed $count images: $converted converted, $skipped already up-to-date."
