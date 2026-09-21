'use client'

import { useActionState, useState } from 'react'
import { signIn, signOut, signUp, type AuthState } from '@/actions/auth'

const input =
  'relative block w-full appearance-none rounded-[1px] border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm'

export function LoginForm() {
  const [signInState, signInAction, signInPending] = useActionState<AuthState, FormData>(signIn, { error: '' })
  const [signUpState, signUpAction, signUpPending] = useActionState<AuthState, FormData>(signUp, { error: '' })
  const pending = signInPending || signUpPending
  const state = signInState.error ? signInState : signUpState

  return (
    <form className="flex flex-col space-y-6">
      <div className="flex flex-col gap-4">
        <input name="username" aria-label="Username" type="text" autoCapitalize="off" autoComplete="username" spellCheck={false} required maxLength={50} className={input} placeholder="Username" />
        <input name="password" aria-label="Password" type="password" autoComplete="current-password" required maxLength={100} className={input} placeholder="Password" />
        <button
          type="submit"
          className="rounded-[1px] bg-accent1 px-4 py-2 text-xs font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-accent1 focus:ring-offset-2 disabled:opacity-60"
          disabled={pending}
          formAction={signInAction}
        >
          Log in
        </button>
        <button
          type="submit"
          className="rounded-[2px] border-[1px] border-accent1 bg-white px-4 py-2 text-xs font-semibold text-accent1 disabled:opacity-60"
          disabled={pending}
          formAction={signUpAction}
        >
          Create login
        </button>
      </div>
      {state.error && <div className="text-sm text-red-500">{state.error}</div>}
    </form>
  )
}

/** A small popover: no library, one state, closes on the next click outside. */
function Popover({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button type="button" className="flex flex-row items-center gap-1" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {label}{' '}
        <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
          <polygon points="0,0 5,6 10,0"></polygon>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 z-20 mt-2 w-72 border border-gray-200 bg-white shadow-md ${className ?? ''}`}>{children}</div>
        </>
      )}
    </div>
  )
}

export function SignInSignUp() {
  return (
    <Popover label="Log in" className="px-8 py-4">
      <span className="text-sm font-semibold text-accent1">Log in</span>
      <LoginForm />
    </Popover>
  )
}

export function SignOut({ username }: { username: string }) {
  return (
    <Popover label={username} className="flex w-32 flex-col items-center px-8 py-4">
      <form action={signOut}>
        <button type="submit" className="rounded-[2px] border-[1px] border-accent1 bg-white px-4 py-2 text-xs font-semibold text-accent1">
          Sign Out
        </button>
      </form>
    </Popover>
  )
}
