'use server'

import * as z from 'zod'
import { createUser, getUserByUsername } from '@/lib/queries'
import { clearSession, hashPassword, setSession, verifyPassword } from '@/lib/session'
import { revalidate } from '@rsc-kit/core/revalidate'

const credentials = z.object({ username: z.string().min(1).max(50), password: z.string().min(1).max(100) })

export interface AuthState {
  error: string
}

function parse(formData: FormData) {
  return credentials.safeParse({ username: formData.get('username'), password: formData.get('password') })
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = parse(formData)

  if (!parsed.success) return { error: 'A username and a password, please.' }

  const { username, password } = parsed.data

  if (await getUserByUsername(username)) return { error: 'Username already taken. Please try again.' }

  const user = await createUser(username, await hashPassword(password))

  await setSession(user.id)
  revalidate('all')

  return { error: '' }
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = parse(formData)

  if (!parsed.success) return { error: 'A username and a password, please.' }

  const { username, password } = parsed.data
  const user = await getUserByUsername(username)

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: 'Invalid username or password. Please try again.' }
  }

  await setSession(user.id)
  revalidate('all')

  return { error: '' }
}

export async function signOut(): Promise<void> {
  await clearSession()
  revalidate('all')
}
