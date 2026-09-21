'use client'

import { startTransition, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { X } from 'lucide-react'
import Link from '@rsc-kit/core/Link'
import { visit } from '@rsc-kit/core/router'
import type { Route } from '@rsc-kit/core/routes'
import { imageProps } from '@/lib/images'
import type { SearchHit } from '@/lib/queries'

// The url, in the browser only. The header is in every stored shell, and a
// shell for /products/[category]/[subcategory] serves every subcategory -
// so a server render has no pathname to give it, and usePathname() would
// rightly send this component to a Suspense fallback. The box only needs
// the url to echo a subcategory's name, which can wait for the browser.
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  const notify = () => listeners.forEach((l) => l())
  window.addEventListener('rsc-navigate', notify)
  window.addEventListener('popstate', notify)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('rsc-navigate', notify)
    window.removeEventListener('popstate', notify)
  }
}
const useClientPathname = () => useSyncExternalStore(subscribe, () => window.location.pathname, () => null)

export function SearchDropdown() {
  const [term, setTerm] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const pathname = useClientPathname()

  // Ask the api route as the term changes; an answer for a term no longer in
  // the box is dropped. The route is cacheable, so a term typed twice is
  // the browser's second time.
  useEffect(() => {
    if (term.length === 0) return

    const asked = term
    const controller = new AbortController()

    fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal }).then(
      async (res) => {
        if (inputRef.current?.value !== asked) return

        const found = (await res.json()) as SearchHit[]

        startTransition(() => {
          setHits(found)
          setLoading(false)
        })
      },
      () => {},
    )

    return () => controller.abort()
  }, [term])

  // On a subcategory page the box shows its name, as the original does.
  // Derived from the url at render, not synced in an effect.
  const [seenPathname, setSeenPathname] = useState(pathname)

  if (seenPathname !== pathname) {
    setSeenPathname(pathname)

    const parts = (pathname ?? '').split('/').filter(Boolean)

    if (parts[0] === 'products' && parts.length === 3) setTerm(decodeURIComponent(parts[2]).replaceAll('-', ' '))
    else if (parts[0] !== 'products' || parts.length < 3) setTerm('')
  }

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', onDown)

    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setHighlighted((i) => (i < hits.length - 1 ? i + 1 : 0))
    else if (e.key === 'ArrowUp') setHighlighted((i) => (i > 0 ? i - 1 : hits.length - 1))
    else if (e.key === 'Enter' && highlighted >= 0) {
      const hit = hits[highlighted]!

      void visit(hit.href as Route)
      setTerm(hit.name)
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="font-sans" ref={boxRef}>
      <div className="relative flex-grow">
        <div className="relative">
          <input
            ref={inputRef}
            autoCapitalize="off"
            autoCorrect="off"
            type="text"
            placeholder="Search..."
            value={term}
            onChange={(e) => {
              setTerm(e.target.value)
              setOpen(e.target.value.length > 0)
              setHighlighted(-1)
              setLoading(e.target.value.length > 0)
              if (e.target.value.length === 0) setHits([])
            }}
            onKeyDown={onKeyDown}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 font-sans text-sm font-medium sm:w-[300px] md:w-[375px]"
          />
          <X
            className={`absolute right-7 top-2 h-5 w-5 text-gray-500 ${open ? '' : 'hidden'}`}
            onClick={() => {
              setTerm('')
              setOpen(false)
            }}
          />
        </div>
        {open && (
          <div className="absolute z-10 w-full border border-gray-200 bg-white shadow-lg">
            <div className="h-[300px] overflow-y-auto">
              {hits.length > 0 ? (
                hits.map((hit, index) => (
                  <Link href={hit.href as Route} key={hit.slug}>
                    <div
                      className={`flex cursor-pointer items-center p-2 ${index === highlighted ? 'bg-gray-100' : ''}`}
                      onMouseEnter={() => setHighlighted(index)}
                      onClick={() => {
                        setTerm(hit.name)
                        setOpen(false)
                        inputRef.current?.blur()
                      }}
                    >
                      <img loading="eager" decoding="sync" {...imageProps(hit.image_url, 48)} alt="" className="h-10 w-10 pr-2" height={40} width={40} />
                      <span className="text-sm">{hit.name}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500">{loading ? 'Loading...' : 'No results found'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
