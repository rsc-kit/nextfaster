import type { Metadata } from '@rsc-kit/core/metadata'
import { notFound } from '@rsc-kit/core/not-found'
import { getProductDetails, getProductsForSubcategory } from '@/lib/queries'
import { imageProps } from '@/lib/images'
import { ProductLink } from '@/components/product-card'
import { Suspense } from 'react'
import { AddToCartForm } from '@/components/add-to-cart-form'
import { ProductSkeleton } from '@/components/product-skeleton'

// A million products: one shell for the pattern, the product per request.

export async function generateMetadata({ params }: { params: Promise<{ product: string }> }): Promise<Metadata> {
  const { product: slug } = await params
  const product = await getProductDetails(decodeURIComponent(slug))

  if (!product) notFound()

  return { title: product.name, openGraph: { title: product.name, description: product.description } }
}

// The frame is the stored shell for a million products; the product waits
// inside the boundary and the request fills it.
export default function ProductPage({ params }: { params: Promise<{ product: string; subcategory: string; category: string }> }) {
  return (
    <div className="container p-4">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  )
}

async function ProductDetails({ params }: { params: Promise<{ product: string; subcategory: string; category: string }> }) {
  const { product: slug, subcategory, category } = await params
  const [product, siblings] = await Promise.all([
    getProductDetails(decodeURIComponent(slug)),
    getProductsForSubcategory(decodeURIComponent(subcategory)),
  ])

  if (!product) notFound()

  const at = siblings.findIndex((p) => p.slug === product.slug)
  const related = [...siblings.slice(at + 1), ...siblings.slice(0, Math.max(at, 0))]

  return (
    <>
      <h1 className="border-t-2 pt-1 text-xl font-bold text-accent1">{product.name}</h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <img
            loading="eager"
            decoding="sync"
            {...imageProps(product.image_url, 256)}
            alt={`A small picture of ${product.name}`}
            height={256}
            width={256}
            className="h-56 w-56 flex-shrink-0 border-2 md:h-64 md:w-64"
          />
          <p className="flex-grow text-base">{product.description}</p>
        </div>
        <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
        <AddToCartForm productSlug={product.slug} />
      </div>
      <div className="pt-8">
        {related.length > 0 && <h2 className="text-lg font-bold text-accent1">Explore more products</h2>}
        <div className="flex flex-row flex-wrap gap-2">
          {related.map((p) => (
            <ProductLink key={p.slug} loading="lazy" categorySlug={category} subcategorySlug={subcategory} product={p} />
          ))}
        </div>
      </div>
    </>
  )
}
