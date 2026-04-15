import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export const metadata: Metadata = { title: 'Profile' }

async function getUser(id: string) {
  await connectDB()
  const user = await User.findById(id).populate('profile').lean()
  return JSON.parse(JSON.stringify(user))
}

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const user = await getUser(session.id)
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Profile</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your personal information</p>
      <ProfileForm user={user} />
    </div>
  )
}
