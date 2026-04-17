import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import User from '@/models/User'
import CourseProgress from '@/models/CourseProgress'
import { getSession } from '@/lib/session'
import { sendEmail, enrollmentEmailHtml } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Student') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseIds } = await req.json()

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findById(session.id)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    // Enroll student in all courses
    for (const courseId of courseIds) {
      const course = await Course.findById(courseId)
      if (!course) continue
      if (course.studentsEnrolled.map(s => s.toString()).includes(session.id)) continue

      course.studentsEnrolled.push(user._id as any)
      course.numberOfEnrolledStudents += 1
      await course.save()

      user.courses.push(course._id as any)
      await CourseProgress.create({ courseId, userId: session.id, completedVideos: [] })

      try {
        await sendEmail(user.email, 'Enrollment Confirmed!', enrollmentEmailHtml(course.title, user.firstName))
      } catch {}
    }

    await user.save()
    return NextResponse.json({ success: true, message: 'Payment verified and enrollment complete' })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
