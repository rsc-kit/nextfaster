import Link from '@rsc-kit/core/Link'

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-accent1">Not found</h1>
      <p className="text-sm text-gray-600">A million products, and not this one.</p>
      <Link href="/" className="text-accent1 hover:underline">
        Back to the store
      </Link>
    </main>
  )
}
