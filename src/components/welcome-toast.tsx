'use client'

import { startTransition, useEffect, useState } from 'react'

/** The original's welcome note, without a toast library: one card, once. */
export function WelcomeToast() {
  // Decided after mount, from the window and the cookie, so the server's
  // render and the first client render agree.
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const wanted = window.innerHeight >= 850 && !document.cookie.includes('welcome-toast=3')

    if (wanted) startTransition(() => setShown(true))
  }, [])

  if (!shown) return null

  return (
    <div className="fixed bottom-10 right-4 z-20 max-w-sm border border-gray-200 bg-white p-4 text-sm shadow-lg">
      <p className="font-semibold">🚀 Welcome to NextFaster, on rsc-kit</p>
      <p className="mt-2">
        A port of the NextFaster e-commerce demo. All of the 1M products on this site are AI generated. Every tap
        leaves its timing on the browser's timeline: <code>performance.getEntriesByName('rsc-kit:navigate')</code>.
      </p>
      <hr className="my-2" />
      <a href="https://github.com/rsc-kit/nextfaster" className="font-semibold text-accent1 hover:underline" target="_blank" rel="noreferrer">
        Get the source
      </a>
      <button
        type="button"
        className="ml-4 text-gray-500 hover:underline"
        onClick={() => {
          document.cookie = 'welcome-toast=3;max-age=31536000;path=/'
          setShown(false)
        }}
      >
        Dismiss
      </button>
    </div>
  )
}
