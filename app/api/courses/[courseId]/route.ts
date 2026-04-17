import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import Section from '@/models/Section'
import SubSection from '@/models/SubSection'
import { getSession } from '@/lib/session'

type Params = { params: Promise<{ courseId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { courseId } = await params
    await connectDB()
    const course = await Course.findById(courseId)
      .populate('instructor', 'firstName lastName avatar')
      .populate('category', 'name')
      .populate({ path: 'sections', populate: { path: 'subSections', select: 'title timeDuration' } })
      .populate({ path: 'reviews', populate: { path: 'user', select: 'firstName lastName avatar' } })
      .lean()

    if (!course) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: course })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { courseId } = await params
    await connectDB()
    const course = await Course.findById(courseId)
    if (!course) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })

    if (course.instructor.toString() !== session.id && session.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const allowed = ['title', 'description', 'whatYouWillLearn', 'price', 'category', 'tags', 'instructions', 'status', 'thumbnail']
    allowed.forEach(k => { if (body[k] !== undefined) (course as any)[k] = body[k] })
    await course.save()

    return NextResponse.json({ success: true, message: 'Course updated', data: course })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { courseId } = await params
    await connectDB()
    const course = await Course.findById(courseId).populate({ path: 'sections', populate: { path: 'subSections' } })
    if (!course) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })

    if (course.instructor.toString() !== session.id && session.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    // Cascade delete sections and subsections
    for (const section of (course as any).sections) {
      await SubSection.deleteMany({ _id: { $in: section.subSections } })
      await Section.findByIdAndDelete(section._id)
    }
    await course.deleteOne()

    return NextResponse.json({ success: true, message: 'Course deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
