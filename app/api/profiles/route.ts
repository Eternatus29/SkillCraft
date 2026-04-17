import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Profile from '@/models/Profile'
import { getSession } from '@/lib/session'
import { createSession } from '@/lib/session'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { firstName, lastName, gender, dob, about, contactNumber } = await req.json()

    await connectDB()
    const user = await User.findById(session.id)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    await user.save()

    await Profile.findByIdAndUpdate(user.profile, { gender, dob, about, contactNumber }, { upsert: true })

    // Refresh session with updated name
    await createSession({
      ...session,
      firstName: user.firstName,
      lastName: user.lastName,
    })

    return NextResponse.json({ success: true, message: 'Profile updated' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
