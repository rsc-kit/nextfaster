import { getCollections, getProductCount } from '@/lib/queries'
import { CategoryGrid } from '@/components/category-grid'

export default async function Home() {
  const [collections, productCount] = await Promise.all([getCollections(), getProductCount()])
  // How many tiles precede each collection, so the first fifteen on the page load eagerly.
  const before = collections.map((_, i) => collections.slice(0, i).reduce((n, c) => n + c.categories.length, 0))

  return (
    <div className="w-full p-4">
      <div className="mb-2 w-full flex-grow border-b-[1px] border-accent1 text-sm font-semibold text-black">
        Explore {productCount.toLocaleString()} products
      </div>
      {collections.map((collection, i) => (
        <CategoryGrid key={collection.slug} name={collection.name} categories={collection.categories} eagerFrom={before[i]} />
      ))}
    </div>
  )
}
