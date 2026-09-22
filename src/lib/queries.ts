/**
 * Every read the pages make. Plain SQL over the five tables; the request
 * scope's cache() keeps a read made twice in one render to one query, and
 * cached() keeps the catalogue's answers for two hours - see lib/cached.
 */

import { cache } from '@rsc-kit/core/cache'
import { TWO_HOURS, cached } from '@/lib/cached'
import { db } from '@/db'
import type { Category, Collection, Product, Subcategory, Subcollection, User } from '@/db/types'

export const getCollections = cache(cached('getCollections', TWO_HOURS, async () => {
  const d = await db()
  const [collections, categories] = await Promise.all([
    d.all<Collection>('SELECT id, name, slug FROM collections ORDER BY name'),
    d.all<Category>('SELECT slug, name, collection_id, image_url FROM categories ORDER BY name'),
  ])

  return collections.map((collection) => ({
    ...collection,
    categories: categories.filter((c) => c.collection_id === collection.id),
  }))
}))

export const getCollectionDetails = cache(cached('getCollectionDetails', TWO_HOURS, async (slug: string) => {
  const d = await db()
  const collection = await d.get<Collection>('SELECT id, name, slug FROM collections WHERE slug = ?', slug)

  if (!collection) return null

  const categories = await d.all<Category>(
    'SELECT slug, name, collection_id, image_url FROM categories WHERE collection_id = ? ORDER BY name',
    collection.id,
  )

  return { ...collection, categories }
}))

export const getProductCount = cache(cached('getProductCount', TWO_HOURS, async () => {
  const d = await db()
  const row = await d.get<{ count: number }>('SELECT count(*) AS count FROM products')

  return row?.count ?? 0
}))

export const getCategory = cache(cached('getCategory', TWO_HOURS, async (slug: string) => {
  const d = await db()
  const category = await d.get<Category>('SELECT slug, name, collection_id, image_url FROM categories WHERE slug = ?', slug)

  if (!category) return null

  const [subcollections, subcategories] = await Promise.all([
    d.all<Subcollection>('SELECT id, name, category_slug FROM subcollections WHERE category_slug = ? ORDER BY name', slug),
    d.all<Subcategory & { category_slug: string }>(
      `SELECT s.slug, s.name, s.subcollection_id, s.image_url
         FROM subcategories s JOIN subcollections sc ON sc.id = s.subcollection_id
        WHERE sc.category_slug = ? ORDER BY s.name`,
      slug,
    ),
  ])

  return {
    ...category,
    subcollections: subcollections.map((sc) => ({
      ...sc,
      subcategories: subcategories.filter((s) => s.subcollection_id === sc.id),
    })),
  }
}))

export const getCategoryProductCount = cache(cached('getCategoryProductCount', TWO_HOURS, async (slug: string) => {
  const d = await db()
  const row = await d.get<{ count: number }>(
    `SELECT count(*) AS count FROM products p
       JOIN subcategories s ON s.slug = p.subcategory_slug
       JOIN subcollections sc ON sc.id = s.subcollection_id
      WHERE sc.category_slug = ?`,
    slug,
  )

  return row?.count ?? 0
}))

export const getSubcategory = cache(cached('getSubcategory', TWO_HOURS, async (slug: string) => {
  const d = await db()

  return d.get<Subcategory>('SELECT slug, name, subcollection_id, image_url FROM subcategories WHERE slug = ?', slug)
}))

export const getProductsForSubcategory = cache(cached('getProductsForSubcategory', TWO_HOURS, async (slug: string) => {
  const d = await db()

  return d.all<Product>(
    'SELECT slug, name, description, price, subcategory_slug, image_url FROM products WHERE subcategory_slug = ? ORDER BY slug',
    slug,
  )
}))

export const getSubcategoryProductCount = cache(cached('getSubcategoryProductCount', TWO_HOURS, async (slug: string) => {
  const d = await db()
  const row = await d.get<{ count: number }>('SELECT count(*) AS count FROM products WHERE subcategory_slug = ?', slug)

  return row?.count ?? 0
}))

export const getProductDetails = cache(cached('getProductDetails', TWO_HOURS, async (slug: string) => {
  const d = await db()

  return d.get<Product>('SELECT slug, name, description, price, subcategory_slug, image_url FROM products WHERE slug = ?', slug)
}))

/** Products by slug, each with the category its url needs. */
export const getProductsBySlugs = cache(cached('getProductsBySlugs', TWO_HOURS, async (slugs: readonly string[]) => {
  if (slugs.length === 0) return []

  const d = await db()

  return d.all<Product & { category_slug: string }>(
    `SELECT p.slug, p.name, p.description, p.price, p.subcategory_slug, p.image_url, sc.category_slug
       FROM products p
       JOIN subcategories s ON s.slug = p.subcategory_slug
       JOIN subcollections sc ON sc.id = s.subcollection_id
      WHERE p.slug IN (${slugs.map(() => '?').join(',')})`,
    ...slugs,
  )
}))

export interface SearchHit extends Product {
  href: string
}

/** Up to five products whose name starts with, or contains the words of, the term. */
export async function searchProducts(term: string): Promise<SearchHit[]> {
  const d = await db()
  const trimmed = term.trim()

  if (!trimmed) return []

  const select = `SELECT p.slug, p.name, p.description, p.price, p.subcategory_slug, p.image_url,
                         s.slug AS subcategory, c.slug AS category
                    FROM products p
                    JOIN subcategories s ON s.slug = p.subcategory_slug
                    JOIN subcollections sc ON sc.id = s.subcollection_id
                    JOIN categories c ON c.slug = sc.category_slug`

  const rows =
    trimmed.length <= 2
      ? await d.all<Product & { subcategory: string; category: string }>(`${select} WHERE p.name LIKE ? LIMIT 5`, `${trimmed}%`)
      : await d.all<Product & { subcategory: string; category: string }>(
          `${select} WHERE p.rowid IN (SELECT rowid FROM products_fts WHERE products_fts MATCH ? LIMIT 5)`,
          trimmed
            .split(/\s+/)
            .map((word) => `"${word.replace(/"/g, '')}"*`)
            .join(' '),
        )

  return rows.map(({ subcategory, category, ...product }) => ({
    ...product,
    href: `/products/${category}/${subcategory}/${product.slug}`,
  }))
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const d = await db()

  return d.get<User>('SELECT id, username, password_hash FROM users WHERE username = ?', username)
}

export async function getUserById(id: number): Promise<User | null> {
  const d = await db()

  return d.get<User>('SELECT id, username, password_hash FROM users WHERE id = ?', id)
}

export async function createUser(username: string, passwordHash: string): Promise<User> {
  const d = await db()

  await d.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', username, passwordHash)

  return (await getUserByUsername(username))!
}
