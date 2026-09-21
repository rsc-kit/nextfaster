import { getUser } from '@/lib/session'
import { LoginForm, SignInSignUp, SignOut } from './auth-client'

export async function AuthServer() {
  const user = await getUser()

  if (!user) return <SignInSignUp />

  return <SignOut username={user.username} />
}

export async function PlaceOrderAuth() {
  const user = await getUser()

  if (user) return null

  return (
    <>
      <p className="font-semibold text-accent1">Log in to place an order</p>
      <LoginForm />
    </>
  )
}
