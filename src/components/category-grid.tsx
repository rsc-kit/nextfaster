import Link from '@rsc-kit/core/Link'
import { imageProps } from '@/lib/images'
import type { Category } from '@/db/types'

/** One collection's categories, as the tiles the home and collection pages draw. */
export function CategoryGrid({
  name,
  categories,
  eagerFrom = 0,
}: {
  name: string
  categories: Category[]
  /** How many tiles before this one were already eager, so the first 15 on a page load first. */
  eagerFrom?: number
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{name}</h2>
      <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
        {categories.map((category, i) => (
          <Link key={category.slug} className="flex w-[125px] flex-col items-center text-center" href={`/products/${category.slug}`}>
            {/*
              Eager, and low priority. Eager so the first screen's tiles are
              asked for at once; low so they are not preloaded from the head
              at high priority, where they competed with the document and the
              runtime for the first paint - which is the heading, not a 2 kB
              tile - and Lighthouse's mobile simulation counted all fifteen
              against it.
            */}
            <img
              loading={eagerFrom + i < 15 ? 'eager' : 'lazy'}
              fetchPriority="low"
              decoding="sync"
              {...imageProps(category.image_url, 48)}
              alt={`A small picture of ${category.name}`}
              className="mb-2 h-14 w-14 border hover:bg-accent2"
              width={48}
              height={48}
            />
            <span className="text-xs">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
