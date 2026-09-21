import { getCart } from '@/lib/cart'

/** The badge on ORDER: how many things are in the cart cookie. */
export async function Cart() {
  const cart = await getCart()

  if (cart.length === 0) return null

  const total = cart.reduce((sum, item) => sum + item.quantity, 0)

  return <div className="absolute -right-3 -top-1 rounded-full bg-accent2 px-1 text-xs text-accent1">{total}</div>
}
