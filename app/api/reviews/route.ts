import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import Course from '@/models/Course'
import User from '@/models/User'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    await connectDB()
    const reviews = await Review.find()
      .populate('user', 'firstName lastName avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    return NextResponse.json({ success: true, data: reviews })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Student') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { courseId, review, rating } = await req.json()
    if (!courseId || !review || !rating) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })
    }

    await connectDB()

    // Check enrollment
    const user = await User.findById(session.id)
    if (!user?.courses.map(c => c.toString()).includes(courseId)) {
      return NextResponse.json({ success: false, message: 'You must be enrolled to review this course' }, { status: 403 })
    }

    // Check duplicate
    if (await Review.findOne({ course: courseId, user: session.id })) {
      return NextResponse.json({ success: false, message: 'You have already reviewed this course' }, { status: 409 })
    }

    const newReview = await Review.create({ review, rating, user: session.id, course: courseId })
    await Course.findByIdAndUpdate(courseId, { $push: { reviews: newReview._id } })

    return NextResponse.json({ success: true, data: newReview }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
