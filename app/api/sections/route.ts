import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import Section from '@/models/Section'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Instructor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { title, courseId } = await req.json()
    if (!title || !courseId) return NextResponse.json({ success: false, message: 'Title and courseId required' }, { status: 400 })

    await connectDB()
    const course = await Course.findById(courseId)
    if (!course || course.instructor.toString() !== session.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const section = await Section.create({ title })
    course.sections.push(section._id as any)
    await course.save()

    return NextResponse.json({ success: true, data: section }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Instructor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { sectionId, title } = await req.json()
    if (!sectionId || !title) return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })

    await connectDB()
    const section = await Section.findByIdAndUpdate(sectionId, { title }, { new: true })
    return NextResponse.json({ success: true, data: section })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Instructor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { sectionId, courseId } = await req.json()
    await connectDB()

    await Section.findByIdAndDelete(sectionId)
    await Course.findByIdAndUpdate(courseId, { $pull: { sections: sectionId } })

    return NextResponse.json({ success: true, message: 'Section deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
