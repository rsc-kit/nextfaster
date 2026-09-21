import { Suspense } from 'react'
import type { Metadata } from '@rsc-kit/core/metadata'
import { OrderHistory } from './dynamic'

export const metadata: Metadata = { title: 'Order History' }

export default function OrderHistoryPage() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto p-1 sm:p-3">
        <h1 className="mb-4 border-b border-gray-200 text-2xl text-accent1">Order History</h1>
        <Suspense>
          <OrderHistory />
        </Suspense>
      </div>
    </main>
  )
}
