import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Profile from '@/models/Profile'
import OTP from '@/models/OTP'
import { createSession } from '@/lib/session'
import { generateAvatar } from '@/lib/utils'
import type { SessionUser } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, role, otp } = await req.json()

    if (!firstName || !lastName || !email || !password || !role || !otp) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }

    await connectDB()

    // Verify OTP
    const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 })
    if (!latestOtp || latestOtp.otp !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Check existing user
    if (await User.findOne({ email })) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = await Profile.create({})
    const avatar = generateAvatar(firstName, lastName)

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      avatar,
      profile: profile._id,
    })

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    }

    await createSession(sessionUser)
    return NextResponse.json({ success: true, message: 'Account created successfully', data: sessionUser }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
