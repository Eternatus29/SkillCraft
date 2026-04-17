import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { getSession } from '@/lib/session'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) return NextResponse.json({ success: false, message: 'Both passwords required' }, { status: 400 })

    await connectDB()
    const user = await User.findById(session.id)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })

    if (newPassword.length < 8) return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
