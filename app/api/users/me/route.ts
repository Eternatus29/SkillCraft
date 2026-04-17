import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import CourseProgress from '@/models/CourseProgress'
import { getSession, deleteSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.id).populate('profile').lean()
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    await connectDB()
    await CourseProgress.deleteMany({ userId: session.id })
    await User.findByIdAndDelete(session.id)
    await deleteSession()

    return NextResponse.json({ success: true, message: 'Account deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
