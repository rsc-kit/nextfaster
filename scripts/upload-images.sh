#!/bin/bash
# The resized images into the R2 bucket, at the key the pages compute:
#   products/<name>@48.webp  ->  r2://nextfaster-images/products/<name>@48.webp
# One put per file through wrangler, sixteen at a time; a year of cache on
# each, since a key never changes what it holds.
cd "$(dirname "$0")/.." || exit 1
put() {
  key="${1#data/images/}"
  bunx wrangler r2 object put "nextfaster-images/$key" --file "$1" --content-type image/webp --cache-control "public, max-age=31536000, immutable" --remote >/dev/null 2>&1 || echo "FAILED $key"
}
export -f put
find data/images -name '*.webp' -print0 | xargs -0 -P 16 -n 1 bash -c 'put "$0"'
echo done
