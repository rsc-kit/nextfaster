import type { ReactNode } from 'react'
import type { Metadata } from '@rsc-kit/core/metadata'
import { notFound } from '@rsc-kit/core/not-found'
import { getCategory } from '@/lib/queries'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategory(decodeURIComponent(slug))

  if (!category) notFound()

  const examples = category.subcollections
    .slice(0, 2)
    .map((s) => s.name)
    .join(', ')
    .toLowerCase()

  return {
    title: category.name,
    openGraph: {
      title: category.name,
      description: `Choose from our selection of ${category.name.toLowerCase()}, including ${examples}${category.subcollections.length > 1 ? ',' : ''} and more. In stock and ready to ship.`,
    },
  }
}

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return children
}
