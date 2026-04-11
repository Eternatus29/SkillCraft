'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  User,
  Settings,
  PlusCircle,
  BarChart2,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

interface SidebarProps {
  role: Role
}

const studentLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/enrolled-courses', label: 'My Learning', icon: BookOpen },
  { href: '/dashboard/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const instructorLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/dashboard/add-course', label: 'Add Course', icon: PlusCircle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/users', label: 'Users', icon: User },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const links = role === 'Student' ? studentLinks : role === 'Instructor' ? instructorLinks : adminLinks

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] hidden md:block">
      <nav className="p-4 space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-violet-600' : 'text-gray-400')} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
