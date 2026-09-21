import { notFound } from '@rsc-kit/core/not-found'
import { getCollectionDetails, getCollections } from '@/lib/queries'
import { CategoryGrid } from '@/components/category-grid'

// Every collection, so each is a stored page.
export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ collection: c.slug }))
}

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: slug } = await params
  const collection = await getCollectionDetails(decodeURIComponent(slug))

  if (!collection) notFound()

  return (
    <div className="w-full p-4">
      <CategoryGrid name={collection.name} categories={collection.categories} />
    </div>
  )
}
