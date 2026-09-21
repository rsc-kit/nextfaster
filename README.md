# NextFaster, on rsc-kit

A port of [NextFaster](https://github.com/ethanniser/NextFaster) — the
e-commerce demo with a million AI-generated products — to
[rsc-kit](https://rsc-kit.dev), running on Cloudflare Workers with D1 and R2.

Live: <https://faster.rsc-kit.dev>

## What is different from the original

- The pages are the same files, route for route. `generateMetadata`,
  `generateStaticParams`, `notFound()`, `cookies()`, `useActionState`: unchanged.
- No image optimiser. The 2,587 images were resized once (`scripts/resize-images.sh`)
  into webp at 48, 96, 256 and 512 px and uploaded to R2 (`scripts/upload-images.sh`).
- No `unstable_cache`. The pages that read nothing per request are stored at
  build; the rest read D1 per request. There is no server-side data cache.
- No Drizzle. Twelve queries in plain SQL, `bun:sqlite` locally and D1 on Workers
  (`src/db/index.ts`).
- The product card is a server component with no JavaScript. The original
  needed a client component and an API route to preload the next page's images;
  here the router does it as the payload lands, and renders the page hidden on
  touch.

## Running it

```sh
bun install
python3 scripts/convert.py data/data.sql data/nextfaster.sqlite   # from NextFaster's data.zip
bun run dev
```

Every navigation leaves its timing on the browser's timeline:

```js
performance.getEntriesByName('rsc-kit:navigate').map((m) => Math.round(m.duration))
```

MIT, like the original.
