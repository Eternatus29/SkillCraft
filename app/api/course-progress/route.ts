import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import CourseProgress from '@/models/CourseProgress'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Student') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { courseId, subSectionId } = await req.json()
    if (!courseId || !subSectionId) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })
    }

    await connectDB()
    const progress = await CourseProgress.findOneAndUpdate(
      { courseId, userId: session.id },
      { $addToSet: { completedVideos: subSectionId } },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true, data: progress })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
