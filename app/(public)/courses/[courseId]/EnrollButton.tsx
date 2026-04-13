'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/store/useCart'
import type { CartItem } from '@/types'

interface EnrollButtonProps {
  courseId: string
  courseTitle: string
  thumbnail: string
  price: number
  instructor: { firstName: string; lastName: string }
  category: { name: string }
  isEnrolled: boolean
  isLoggedIn: boolean
}

export default function EnrollButton({ courseId, courseTitle, thumbnail, price, instructor, category, isEnrolled, isLoggedIn }: EnrollButtonProps) {
  const { addItem, hasItem } = useCart()
  const inCart = hasItem(courseId)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (isEnrolled) {
    return (
      <Link
        href={`/view-course/${courseId}`}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
      >
        <Play className="w-4 h-4" /> Go to Course
      </Link>
    )
  }

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?redirect=/courses/${courseId}`}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition-colors"
      >
        Enroll Now
      </Link>
    )
  }

  if (price === 0) {
    return (
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await fetch('/api/payments/enroll-free', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courseId }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.message ?? 'Enrollment failed'); return }
            toast.success('Enrolled successfully!')
            router.refresh()
          })
        }}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Enroll for Free
      </button>
    )
  }

  if (inCart) {
    return (
      <Link
        href="/dashboard/cart"
        className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-colors"
      >
        <ShoppingCart className="w-4 h-4" /> Go to Cart
      </Link>
    )
  }

  return (
    <button
      onClick={() => {
        const item: CartItem = { _id: courseId, title: courseTitle, thumbnail, price, instructor, category }
        addItem(item)
        toast.success('Added to cart!')
      }}
      className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition-colors"
    >
      <ShoppingCart className="w-4 h-4" /> Add to Cart
    </button>
  )
}
