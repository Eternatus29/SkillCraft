import { NextRequest, NextResponse } from 'next/server'
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

    const { courseId } = await req.json()
    if (!courseId) return NextResponse.json({ success: false, message: 'courseId required' }, { status: 400 })

    await connectDB()
    const course = await Course.findById(courseId)
    if (!course) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    if (course.price > 0) return NextResponse.json({ success: false, message: 'This is a paid course' }, { status: 400 })

    const user = await User.findById(session.id)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (course.studentsEnrolled.map(s => s.toString()).includes(session.id)) {
      return NextResponse.json({ success: false, message: 'Already enrolled' }, { status: 409 })
    }

    course.studentsEnrolled.push(user._id as any)
    course.numberOfEnrolledStudents += 1
    await course.save()

    user.courses.push(course._id as any)
    await user.save()

    await CourseProgress.create({ courseId, userId: session.id, completedVideos: [] })

    try {
      await sendEmail(user.email, 'Enrollment Confirmed!', enrollmentEmailHtml(course.title, user.firstName))
    } catch {}

    return NextResponse.json({ success: true, message: 'Enrolled successfully' })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
