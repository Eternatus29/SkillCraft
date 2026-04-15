'use client'

import type { Metadata } from 'next'
import { useState, useTransition } from 'react'
import { Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const router = useRouter()

  function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: fd.get('currentPassword'), newPassword: fd.get('newPassword') }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Failed'); return }
      toast.success('Password changed!')
      ;(e.target as HTMLFormElement).reset()
    })
  }

  function handleDeleteAccount() {
    if (!confirm('Are you sure? This action is irreversible.')) return
    startDeleteTransition(async () => {
      const res = await fetch('/api/users/me', { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to delete account'); return }
      toast.success('Account deleted')
      router.push('/')
    })
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences</p>
      </div>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Change Password</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
          <div className="relative">
            <input name="currentPassword" type={showCurrent ? 'text' : 'password'} required className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
          <div className="relative">
            <input name="newPassword" type={showNew ? 'text' : 'password'} required minLength={8} className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={isPending} className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all your data. This cannot be undone.</p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="flex items-center gap-2 border border-red-300 text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-60 text-sm"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Account
        </button>
      </div>
    </div>
  )
}
