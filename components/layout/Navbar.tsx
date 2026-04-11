'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BookOpen, ShoppingCart, Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useCart } from '@/store/useCart'
import type { SessionUser } from '@/types'

interface NavbarProps {
  user: SessionUser | null
}

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const cartCount = useCart((s) => s.items.length)
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    })
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-violet-700">
            <BookOpen className="w-6 h-6" />
            <span>SkillCraft</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'text-violet-700'
                    : 'text-gray-600 hover:text-violet-700'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'Student' && (
                  <Link href="/dashboard/cart" className="relative p-2 text-gray-600 hover:text-violet-700">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-violet-700"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-xs">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={logout}
                        disabled={isPending}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-violet-700"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-violet-700"
            >
              {l.label}
            </Link>
          ))}
          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 py-2">
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-sm bg-violet-600 text-white py-2 px-4 rounded-lg text-center"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
