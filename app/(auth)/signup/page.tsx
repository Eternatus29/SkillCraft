import type { Metadata } from 'next'
import SignupForm from './SignupForm'

export const metadata: Metadata = { title: 'Sign up' }

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-gray-500 text-sm mb-6">Join thousands of learners on SkillCraft</p>
      <SignupForm />
    </div>
  )
}
