#!/bin/bash
# The 2,587 images the dump names, from the blob store they were published to, into data/images/ - once, for R2.
cd "$(dirname "$0")/.." || exit 1
fetch() {
  f="data/images/$1"
  [ -s "$f" ] && return
  mkdir -p "$(dirname "$f")"
  curl -sf -o "$f" "https://bevgyjm5apuichhj.public.blob.vercel-storage.com/$1"
}
export -f fetch
tr '\n' '\0' < data/images.txt | xargs -0 -P 16 -n 1 bash -c 'fetch "$0"'
find data/images -type f | wc -l
