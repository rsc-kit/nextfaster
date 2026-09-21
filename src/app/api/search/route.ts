import { searchProducts } from '@/lib/queries'

// /api/search?q=term - up to five products, cacheable for ten minutes.
export async function GET(request: Request): Promise<Response> {
  const term = new URL(request.url).searchParams.get('q')

  if (!term) return Response.json([])

  const hits = await searchProducts(term)
  const response = Response.json(hits)

  response.headers.set('Cache-Control', 'public, max-age=600')

  return response
}
