import Link from '@rsc-kit/core/Link'
import { notFound } from '@rsc-kit/core/not-found'
import { getCategory, getCategoryProductCount, getCollections } from '@/lib/queries'
import { imageProps } from '@/lib/images'

// Every category - 549 - so each is a stored page with its subcategories.
export async function generateStaticParams() {
  return (await getCollections()).flatMap((c) => c.categories.map((category) => ({ category: category.slug })))
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  const decoded = decodeURIComponent(slug)
  const [category, count] = await Promise.all([getCategory(decoded), getCategoryProductCount(decoded)])

  if (!category) notFound()

  return (
    <div className="container p-4">
      {count > 0 && (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {count} {count === 1 ? 'Product' : 'Products'}
        </h1>
      )}
      <div className="space-y-4">
        {category.subcollections.map((subcollection) => (
          <div key={subcollection.id}>
            <h2 className="mb-2 border-b-2 text-lg font-semibold">{subcollection.name}</h2>
            <div className="flex flex-row flex-wrap gap-2">
              {subcollection.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  className="group flex h-full w-full flex-row gap-2 border px-4 py-2 hover:bg-gray-100 sm:w-[200px]"
                  href={`/products/${slug}/${subcategory.slug}`}
                >
                  <div className="py-2">
                    <img
                      loading="eager"
                      decoding="sync"
                      {...imageProps(subcategory.image_url, 48)}
                      alt={`A small picture of ${subcategory.name}`}
                      width={48}
                      height={48}
                      className="h-12 w-12 flex-shrink-0 object-cover"
                    />
                  </div>
                  <div className="flex h-16 flex-grow flex-col items-start py-2">
                    <div className="text-sm font-medium text-gray-700 group-hover:underline">{subcategory.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
