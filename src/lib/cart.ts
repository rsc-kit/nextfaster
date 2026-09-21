/**
 * The cart, in a cookie, as the original keeps it.
 */

import { cookies } from '@rsc-kit/core/request'
import * as z from 'zod'
import { env } from '@/env'
import { getProductsBySlugs } from './queries'

const cartSchema = z.array(z.object({ productSlug: z.string(), quantity: z.number() }))

export type CartItem = z.infer<typeof cartSchema>[number]

export async function getCart(): Promise<CartItem[]> {
  const raw = (await cookies()).get('cart')?.value

  if (!raw) return []

  try {
    return cartSchema.parse(JSON.parse(raw))
  } catch {
    return []
  }
}

export async function updateCart(items: CartItem[]): Promise<void> {
  const jar = await cookies()

  jar.set('cart', JSON.stringify(items), {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function detailedCart() {
  const cart = await getCart()
  const products = await getProductsBySlugs(cart.map((item) => item.productSlug))

  return products.map((product) => ({
    ...product,
    quantity: cart.find((item) => item.productSlug === product.slug)?.quantity ?? 0,
  }))
}
