import type { Metadata } from '@rsc-kit/core/metadata'
import { notFound } from '@rsc-kit/core/not-found'
import { getProductsForSubcategory, getSubcategory, getSubcategoryProductCount } from '@/lib/queries'
import { Suspense } from 'react'
import { ProductLink } from '@/components/product-card'
import { SubcategorySkeleton } from '@/components/subcategory-skeleton'

// 42,236 subcategories: one shell for the pattern, the products per request.

export async function generateMetadata({ params }: { params: Promise<{ subcategory: string }> }): Promise<Metadata> {
  const { subcategory: slug } = await params
  const decoded = decodeURIComponent(slug)
  const [subcategory, count] = await Promise.all([getSubcategory(decoded), getSubcategoryProductCount(decoded)])

  if (!subcategory) notFound()

  return {
    title: subcategory.name,
    openGraph: {
      title: subcategory.name,
      description: count > 1 ? `Choose from over ${count - 1} products in ${subcategory.name}. In stock and ready to ship.` : undefined,
    },
  }
}

// The frame renders at once and is the stored shell for every subcategory;
// the part that needs the url waits inside the boundary, and the request
// fills it. No loading.tsx: a page that awaits above its own boundary has
// nothing to store, and this one never does.
export default function SubcategoryPage({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<SubcategorySkeleton />}>
        <SubcategoryProducts params={params} />
      </Suspense>
    </div>
  )
}

async function SubcategoryProducts({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category, subcategory } = await params
  const decoded = decodeURIComponent(subcategory)
  const [products, count] = await Promise.all([getProductsForSubcategory(decoded), getSubcategoryProductCount(decoded)])

  return (
    <>
      {count > 0 ? (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {count} {count === 1 ? 'Product' : 'Products'}
        </h1>
      ) : (
        <p>No products for this subcategory</p>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {products.map((product) => (
          <ProductLink key={product.slug} loading="eager" categorySlug={category} subcategorySlug={subcategory} product={product} />
        ))}
      </div>
    </>
  )
}
