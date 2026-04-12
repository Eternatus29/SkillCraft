'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'

type Step = 'details' | 'otp'

export default function SignupForm() {
  const [step, setStep] = useState<Step>('details')
  const [showPw, setShowPw] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'Student' as 'Student' | 'Instructor',
  })
  const [otp, setOtp] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role') ?? 'Student') as 'Student' | 'Instructor'

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  function sendOtp() {
    if (!formData.email || !formData.firstName || !formData.password) {
      toast.error('Please fill in all fields first')
      return
    }
    startTransition(async () => {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Failed to send OTP'); return }
      toast.success('OTP sent to your email!')
      setStep('otp')
    })
  }

  function handleSignup() {
    startTransition(async () => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Signup failed'); return }
      toast.success('Account created! Welcome to SkillCraft 🎉')
      router.push('/dashboard')
      router.refresh()
    })
  }

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-7 h-7 text-violet-600" />
          </div>
          <p className="text-sm text-gray-600">
            We&apos;ve sent a 6-digit OTP to <strong>{formData.email}</strong>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="000000"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-center text-xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button
          onClick={handleSignup}
          disabled={isPending || otp.length !== 6}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Creating account…' : 'Verify & Create Account'}
        </button>
        <button
          onClick={() => { setStep('details'); setOtp('') }}
          className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
        >
          ← Go back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 8 characters"
            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">I want to</label>
        <div className="grid grid-cols-2 gap-3">
          {(['Student', 'Instructor'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: r }))}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                formData.role === r
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-violet-400'
              }`}
            >
              {r === 'Student' ? 'Learn' : 'Teach'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={sendOtp}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? 'Sending OTP…' : 'Continue'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-600 font-medium hover:underline">Log in</Link>
      </p>
    </div>
  )
}
