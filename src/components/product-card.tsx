import Link from '@rsc-kit/core/Link'
import { preload } from 'react-dom'
import { imageProps } from '@/lib/images'
import type { Product } from '@/db/types'

/**
 * A product tile. A server component that ships no JavaScript: the
 * original made this a client component to preload the product page's
 * picture from an effect. Here the picture is asked for from the render,
 * through React's own preload, which becomes a <link rel="preload"> in the
 * document's head - so it is decoded by the time the page is tapped, and
 * the tap finds it there whether or not the page's payload was prefetched
 * first. Only the pictures of the tiles drawn at once.
 */
export function ProductLink({
  product,
  categorySlug,
  subcategorySlug,
  loading,
}: {
  product: Product
  categorySlug: string
  subcategorySlug: string
  loading: 'eager' | 'lazy'
}) {
  if (loading === 'eager' && product.image_url) {
    // The same candidates the product page's <img> offers, so the browser
    // chooses the same one here and finds it in its cache there.
    const { src, srcSet } = imageProps(product.image_url, 256)

    preload(src, { as: 'image', imageSrcSet: srcSet })
  }

  return (
    <Link
      className="group flex h-[130px] w-full flex-row border px-4 py-2 hover:bg-gray-100 sm:w-[250px]"
      href={`/products/${categorySlug}/${subcategorySlug}/${product.slug}`}
    >
      <div className="py-2">
        <img
          loading={loading}
          decoding="sync"
          {...imageProps(product.image_url, 48)}
          alt={`A small picture of ${product.name}`}
          width={48}
          height={48}
          className="h-auto w-12 flex-shrink-0 object-cover"
        />
      </div>
      <div className="px-2" />
      <div className="h-26 flex flex-grow flex-col items-start py-2">
        <div className="text-sm font-medium text-gray-700 group-hover:underline">{product.name}</div>
        <p className="overflow-hidden text-xs">{product.description}</p>
      </div>
    </Link>
  )
}
