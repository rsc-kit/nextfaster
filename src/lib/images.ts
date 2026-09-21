/**
 * Product pictures, from the R2 bucket, at the size the page draws them.
 *
 * The dump named 2,587 images at 512 px, reused across a million products.
 * They were resized once at upload - see scripts/upload-images.ts - into
 * webp at 48, 96, 256 and 512, so a card fetches two kilobytes and a product
 * page fifteen, the way an image optimiser would serve them, without one in
 * the request path. `path` is what the database holds: `products/<name>`.
 */

import { env } from '@/env'

export type ImageSize = 48 | 96 | 256 | 512

export function imageUrl(path: string | null, size: ImageSize): string {
  if (!path) return '/placeholder.svg'

  return `${env.PUBLIC_IMAGES_URL}/${path}@${size}.webp`
}

/** `src` and `srcSet` for an image drawn at `size` css pixels, sharp on a 2x screen. */
export function imageProps(path: string | null, size: 48 | 256): { src: string; srcSet?: string } {
  if (!path) return { src: '/placeholder.svg' }

  const twice: ImageSize = size === 48 ? 96 : 512

  return { src: imageUrl(path, size), srcSet: `${imageUrl(path, size)} 1x, ${imageUrl(path, twice)} 2x` }
}
