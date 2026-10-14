#!/usr/bin/env bash
set -euo pipefail

# Optional graphics tool. Lossless crops only: no recoloring or background removal.
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd -- "$script_dir/.." && pwd)"
atlas="${1:-$project_dir/public/assets/ui-layered/ui-atlas.png}"
out="${2:-$project_dir/public/assets/ui-layered}"

if ! command -v magick >/dev/null 2>&1; then
  printf '%s\n' 'ImageMagick 7 est requis uniquement pour réexporter les images.' >&2
  exit 1
fi
if [[ ! -f "$atlas" ]]; then
  printf 'Atlas introuvable : %s\n' "$atlas" >&2
  exit 1
fi
mkdir -p -- "$out"

while read -r name geometry; do
  magick "$atlas" -crop "$geometry" +repage "$out/$name.png"
done <<'RECTS'
button-green 246x134+28+82
button-orange 242x134+278+82
button-blue 244x134+525+82
button-red 244x134+774+82
button-gold 246x134+1023+82
button-taupe 243x134+1270+82
panel-dark 268x204+25+273
panel-paper 248x204+295+273
meter-track 242x68+544+343
meter-green 228x54+792+350
meter-gold 232x54+1034+350
meter-purple 230x54+1282+350
icon-coin 215x222+32+501
icon-logs 241x222+277+501
icon-crystal 206x225+546+494
icon-swords 237x219+782+503
icon-hammer 225x224+1036+502
icon-gear 224x217+1286+509
icon-collect 246x226+29+729
icon-move 225x220+292+737
icon-upgrade 204x219+543+739
icon-info 222x216+779+742
icon-house 238x251+1020+721
icon-map 247x226+1264+730
RECTS
