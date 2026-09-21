'use server'

import { getCart, updateCart } from '@/lib/cart'
import { revalidate } from '@rsc-kit/core/revalidate'

export async function addToCart(_prev: string | null, formData: FormData): Promise<string | null> {
  const productSlug = formData.get('productSlug')

  if (typeof productSlug !== 'string') return null

  const cart = await getCart()
  const existing = cart.find((item) => item.productSlug === productSlug)
  const next = existing
    ? cart.map((item) => (item.productSlug === productSlug ? { ...item, quantity: item.quantity + 1 } : item))
    : [...cart, { productSlug, quantity: 1 }]

  await updateCart(next)
  // The badge in the header reads the cookie; the layouts render again.
  revalidate('all')

  return 'Item added to cart'
}

export async function removeFromCart(formData: FormData): Promise<void> {
  const productSlug = formData.get('productSlug')

  if (typeof productSlug !== 'string') return

  const cart = await getCart()

  if (!cart.some((item) => item.productSlug === productSlug)) return

  await updateCart(cart.filter((item) => item.productSlug !== productSlug))
  revalidate('all')
}
