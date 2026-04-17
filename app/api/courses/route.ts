import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    await connectDB()
    const courses = await Course.find({ status: 'Published' })
      .populate('instructor', 'firstName lastName avatar')
      .populate('category', 'name')
      .sort({ numberOfEnrolledStudents: -1 })
      .lean()
    return NextResponse.json({ success: true, data: courses })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Instructor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const fd = await req.formData()
    const title = fd.get('title') as string
    const description = fd.get('description') as string
    const whatYouWillLearn = fd.get('whatYouWillLearn') as string
    const price = Number(fd.get('price'))
    const category = fd.get('category') as string
    const tags = JSON.parse(fd.get('tags') as string ?? '[]')
    const instructions = JSON.parse(fd.get('instructions') as string ?? '[]')
    const status = (fd.get('status') as string) ?? 'Draft'

    if (!title || !description || !category) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    let thumbnail = ''
    const thumbnailFile = fd.get('thumbnail') as File | null
    if (thumbnailFile && thumbnailFile.size > 0) {
      // In production: upload to Cloudinary and get URL
      // For now, use a placeholder
      thumbnail = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=7c3aed&color=fff&size=512`
    }

    await connectDB()
    const course = await Course.create({
      title,
      description,
      whatYouWillLearn,
      price,
      category,
      tags,
      instructions,
      status,
      thumbnail,
      instructor: session.id,
    })

    return NextResponse.json({ success: true, message: 'Course created', data: course }, { status: 201 })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
