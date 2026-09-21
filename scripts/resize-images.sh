#!/bin/bash
# Every image at the four sizes the pages draw, as webp, beside the original:
#   products/<name>@48.webp, @96, @256, @512
# What an image optimiser would do per request, done once. A 48 px card
# image is about 2 kB; the product page's 256 px about 15 kB.
cd "$(dirname "$0")/.." || exit 1
resize() {
  src="$1"
  for size in 48 96 256 512; do
    out="${src}@${size}.webp"
    [ -s "$out" ] && continue
    cwebp -quiet -q 80 -resize "$size" "$size" "$src" -o "$out"
  done
}
export -f resize
find data/images -type f ! -name '*.webp' -print0 | xargs -0 -P 8 -n 1 bash -c 'resize "$0"'
find data/images -name '*.webp' | wc -l
