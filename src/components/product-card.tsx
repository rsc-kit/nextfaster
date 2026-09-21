import Link from '@rsc-kit/core/Link'
import { imageProps } from '@/lib/images'
import type { Product } from '@/db/types'

/**
 * A product tile. A server component: the original made this a client
 * component to preload the product page's image from an effect. Here the
 * product page is rendered hidden on touch or a settled hover, and a hidden
 * page's images load with it - so the preload is the router's, and this
 * ships no JavaScript.
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
