import './styles.css'
import { Suspense } from 'react'
import type { ReactNode } from 'react'
import type { Metadata } from '@rsc-kit/core/metadata'
import Link from '@rsc-kit/core/Link'
import { MenuIcon } from 'lucide-react'
import { SearchDropdown } from '@/components/search-dropdown'
import { Cart } from '@/components/cart'
import { AuthServer } from '@/components/auth-server'
import { WelcomeToast } from '@/components/welcome-toast'

export const metadata: Metadata = {
  title: { template: '%s | Faster', default: 'Faster' },
  description: 'NextFaster, ported to rsc-kit: a million products on Cloudflare Workers.',
  metadataBase: new URL('https://faster.rsc-kit.dev'),
}

// The chrome: header, footer, and the segment the router swaps between them.
// Reads nothing from the request itself; the two pieces that do - the cart
// badge and who is signed in - sit behind their own Suspense so the rest of
// the document is a stored shell.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col overflow-y-auto overflow-x-hidden antialiased">
        <div>
          <header className="fixed top-0 z-10 flex h-[90px] w-[100vw] flex-grow items-center justify-between border-b-2 border-accent2 bg-background p-2 pb-[4px] pt-2 sm:h-[70px] sm:flex-row sm:gap-4 sm:p-4 sm:pb-[4px] sm:pt-0">
            <div className="flex flex-grow flex-col">
              <div className="absolute right-2 top-2 flex justify-end pt-2 font-sans text-sm hover:underline sm:relative sm:right-0 sm:top-0">
                <Suspense
                  fallback={
                    <button className="flex flex-row items-center gap-1">
                      <div className="h-[20px]" />
                      <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
                        <polygon points="0,0 5,6 10,0"></polygon>
                      </svg>
                    </button>
                  }
                >
                  <AuthServer />
                </Suspense>
              </div>
              <div className="flex w-full flex-col items-start justify-center sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                <Link href="/" className="text-4xl font-bold text-accent1">
                  Faster
                </Link>
                <div className="items flex w-full flex-row items-center justify-between gap-4">
                  <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0">
                    <SearchDropdown />
                  </div>
                  <div className="flex flex-row justify-between space-x-4">
                    <div className="relative">
                      <Link href="/order" className="text-lg text-accent1 hover:underline">
                        ORDER
                      </Link>
                      <Suspense>
                        <Cart />
                      </Suspense>
                    </div>
                    <Link href="/order-history" className="hidden text-lg text-accent1 hover:underline md:block">
                      ORDER HISTORY
                    </Link>
                    <Link
                      href="/order-history"
                      aria-label="Order History"
                      className="block text-lg text-accent1 hover:underline md:hidden"
                    >
                      <MenuIcon />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="pt-[85px] sm:pt-[70px]">{children}</div>
        </div>
        <footer className="fixed bottom-0 flex h-12 w-screen flex-col items-center justify-between space-y-2 border-t border-gray-400 bg-background px-4 font-sans text-[11px] sm:h-6 sm:flex-row sm:space-y-0">
          <div className="flex flex-wrap justify-center space-x-2 pt-2 sm:justify-start">
            <span className="hover:bg-accent2 hover:underline">Home</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">FAQ</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Returns</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Careers</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Contact</span>
          </div>
          <div className="text-center sm:text-right">
            A port of{' '}
            <a href="https://github.com/ethanniser/NextFaster" className="font-bold text-accent1 hover:underline" target="_blank" rel="noreferrer">
              NextFaster
            </a>{' '}
            to{' '}
            <a href="https://github.com/rsc-kit/nextfaster" className="font-bold text-accent1 hover:underline" target="_blank" rel="noreferrer">
              rsc-kit
            </a>
          </div>
        </footer>
        <WelcomeToast />
      </body>
    </html>
  )
}
