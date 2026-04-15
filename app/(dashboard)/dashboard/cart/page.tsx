import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import CartClient from './CartClient'

export const metadata: Metadata = { title: 'Cart' }

export default async function CartPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'Student') redirect('/dashboard')
  return <CartClient />
}
