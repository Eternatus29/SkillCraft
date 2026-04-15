'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd)
    startTransition(async () => {
      const res = await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Update failed'); return }
      toast.success('Profile updated!')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-5">
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-700">
            <Camera className="w-3.5 h-3.5 text-white" />
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{user.role}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
            <input name="firstName" defaultValue={user.firstName} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
            <input name="lastName" defaultValue={user.lastName} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input value={user.email} disabled className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
          <select name="gender" defaultValue={user.profile?.gender ?? ''} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="">Prefer not to say</option>
            {['Male', 'Female', 'Non-Binary', 'Other'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of birth</label>
          <input name="dob" type="date" defaultValue={user.profile?.dob?.split('T')[0]} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact number</label>
          <input name="contactNumber" defaultValue={user.profile?.contactNumber} placeholder="10-digit number" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">About</label>
          <textarea name="about" rows={3} defaultValue={user.profile?.about} placeholder="Tell us about yourself…" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
        </div>
        <button type="submit" disabled={isPending} className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
