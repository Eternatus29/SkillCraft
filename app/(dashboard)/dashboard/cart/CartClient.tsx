'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/store/useCart'
import { formatPrice } from '@/lib/utils'

export default function CartClient() {
  const { items, removeItem, clearCart, total } = useCart()
  const [isPending, startTransition] = useTransition()

  function handleCheckout() {
    startTransition(async () => {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: items.map((i) => i._id) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Checkout failed'); return }
      // Load Razorpay script and open modal
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          key: data.data.key,
          amount: data.data.amount,
          currency: 'INR',
          name: 'SkillCraft',
          description: 'Course Purchase',
          order_id: data.data.orderId,
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, courseIds: items.map((i) => i._id) }),
            })
            const vData = await verifyRes.json()
            if (verifyRes.ok) {
              toast.success('Payment successful! You are now enrolled.')
              clearCart()
              window.location.href = '/dashboard/enrolled-courses'
            } else {
              toast.error(vData.message ?? 'Payment verification failed')
            }
          },
          prefill: { name: 'SkillCraft User' },
          theme: { color: '#7c3aed' },
        })
        rzp.open()
      }
    })
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <ShoppingCart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Browse courses and add them to your cart.</p>
        <Link href="/courses" className="bg-violet-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700">
          Browse Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Shopping Cart</h1>
      <p className="text-gray-500 text-sm mb-8">{items.length} item{items.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-start">
              <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">{item.title[0]}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.instructor.firstName} {item.instructor.lastName}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                <button onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total())}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 disabled:opacity-60"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Processing…' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
