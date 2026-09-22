/**
 * A read kept for a while, in the store the platform already has.
 *
 * NextFaster wraps every query in unstable_cache for two hours: the first
 * visitor pays the database and everyone after reads the cache. That is
 * where "the data is always ready" comes from, not from the framework.
 * Here the store is Cloudflare's Cache API on Workers - per datacenter,
 * expiry by header, no handler to write and no service to run - and a Map
 * under Bun, where there is one process and it is the build's. A store is
 * three methods, so one that spans pods - KV, Redis, a Durable Object - is
 * a file added here, not a rewrite of the queries.
 *
 * For what everyone sees the same: the catalogue. Never a cart or a
 * session; those stay on the database.
 */

export interface Store {
  get(key: string): Promise<string | null>
  put(key: string, value: string, seconds: number): Promise<void>
  delete(key: string): Promise<void>
}

export const TWO_HOURS = 60 * 60 * 2

const onWorkers = typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'

let store: Promise<Store> | null = null
let background: (work: Promise<unknown>) => void = (work) => void work.catch(() => {})

function storeFor(): Promise<Store> {
  return (store ??= onWorkers ? workersStore() : localStore())
}

/** `load`, remembered for `seconds` per distinct set of arguments. */
export function cached<A extends unknown[], T>(
  name: string,
  seconds: number,
  load: (...args: A) => Promise<T>,
): (...args: A) => Promise<T> {
  return async (...args: A) => {
    const key = keyFor(name, args)
    const s = await storeFor()
    const hit = await s.get(key)

    if (hit !== null) return JSON.parse(hit) as T

    const value = await load(...args)

    // Stored after the answer is on its way, not before it.
    background(s.put(key, JSON.stringify(value), seconds))

    return value
  }
}

/** Drop what was remembered for these arguments - after a write that changed it. */
export async function forget(name: string, ...args: unknown[]): Promise<void> {
  await (await storeFor()).delete(keyFor(name, args))
}

function keyFor(name: string, args: unknown[]): string {
  return `${name}/${encodeURIComponent(JSON.stringify(args))}`
}

/**
 * The Cache API: HTTP-shaped, so a key is a url the worker never serves and
 * the TTL is a Cache-Control header. Shared by every isolate in the
 * datacenter; a datacenter that has not seen a product yet asks the
 * database once.
 */
async function workersStore(): Promise<Store> {
  const workers = await import('cloudflare:workers')

  if (typeof workers.waitUntil === 'function') background = (work) => workers.waitUntil(work.catch(() => {}))

  const cache = (caches as unknown as { default: Cache }).default
  const request = (key: string) => new Request(`https://faster.rsc-kit.dev/_cache/${key}`)

  return {
    async get(key) {
      const hit = await cache.match(request(key))

      return hit ? hit.text() : null
    },
    async put(key, value, seconds) {
      await cache.put(
        request(key),
        new Response(value, { headers: { 'Cache-Control': `s-maxage=${seconds}`, 'Content-Type': 'application/json' } }),
      )
    },
    async delete(key) {
      await cache.delete(request(key))
    },
  }
}

async function localStore(): Promise<Store> {
  const held = new Map<string, { value: string; until: number }>()

  return {
    async get(key) {
      const entry = held.get(key)

      if (!entry) return null
      if (entry.until <= Date.now()) {
        held.delete(key)

        return null
      }

      return entry.value
    },
    async put(key, value, seconds) {
      held.set(key, { value, until: Date.now() + seconds * 1000 })
    },
    async delete(key) {
      held.delete(key)
    },
  }
}
