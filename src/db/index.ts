/**
 * The database: D1 on Workers, the same file as SQLite everywhere else.
 *
 * One shape, four methods, raw SQL. The queries are a dozen selects over
 * five tables, and an ORM on a Worker is bundle weight for nothing. On
 * Workers the binding comes from cloudflare:workers, the runtime's own
 * module, imported where the code runs there and nowhere else - vite dev
 * under Bun has no such module. Under Bun the file in data/ answers, which
 * is also what the build renders from: a page that reads a table and
 * nothing from the request is frozen with real data.
 */

export interface Db {
  all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): Promise<T[]>
  get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): Promise<T | null>
  run(sql: string, ...params: unknown[]): Promise<void>
}

const onWorkers = typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'

let instance: Promise<Db> | null = null

export function db(): Promise<Db> {
  return (instance ??= onWorkers ? workersDb() : localDb())
}

async function workersDb(): Promise<Db> {
  const { env } = await import('cloudflare:workers')
  const d1 = (env as { DB: D1Database }).DB

  return {
    async all<T>(sql: string, ...params: unknown[]) {
      const { results } = await d1.prepare(sql).bind(...params).all<T>()

      return results
    },
    async get<T>(sql: string, ...params: unknown[]) {
      return (await d1.prepare(sql).bind(...params).first<T>()) ?? null
    },
    async run(sql: string, ...params: unknown[]) {
      await d1.prepare(sql).bind(...params).run()
    },
  }
}

async function localDb(): Promise<Db> {
  const { Database } = await import('bun:sqlite')
  // Relative to where vite runs - the project - not to the bundle that
  // imports this, which lives under node_modules at build time.
  const sqlite = new Database(`${process.cwd()}/data/nextfaster.sqlite`)

  return {
    async all<T>(sql: string, ...params: unknown[]) {
      return sqlite.query(sql).all(...(params as never[])) as T[]
    },
    async get<T>(sql: string, ...params: unknown[]) {
      return (sqlite.query(sql).get(...(params as never[])) as T | null) ?? null
    },
    async run(sql: string, ...params: unknown[]) {
      sqlite.query(sql).run(...(params as never[]))
    },
  }
}

// The subset of D1's types this file uses, so the app compiles without
// @cloudflare/workers-types on every file.
interface D1Database {
  prepare(sql: string): {
    bind(...params: unknown[]): {
      all<T>(): Promise<{ results: T[] }>
      first<T>(): Promise<T | null>
      run(): Promise<unknown>
    }
  }
}
