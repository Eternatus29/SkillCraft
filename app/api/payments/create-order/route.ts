import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import { getSession } from '@/lib/session'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? '',
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Student') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { courseIds } = await req.json()
    if (!courseIds?.length) return NextResponse.json({ success: false, message: 'No courses selected' }, { status: 400 })

    await connectDB()
    const courses = await Course.find({ _id: { $in: courseIds }, status: 'Published' })
    const totalAmount = courses.reduce((s, c) => s + c.price, 0)

    if (totalAmount === 0) return NextResponse.json({ success: false, message: 'All courses are free, use free enrollment' }, { status: 400 })

    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 })
  }
}
