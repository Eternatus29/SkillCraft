import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-violet-950 via-violet-900 to-indigo-900 px-4">
      <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl mb-8">
        <BookOpen className="w-7 h-7 text-violet-300" />
        SkillCraft
      </Link>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">{children}</div>
      <p className="mt-6 text-violet-300 text-sm">© {new Date().getFullYear()} SkillCraft</p>
    </div>
  )
}
