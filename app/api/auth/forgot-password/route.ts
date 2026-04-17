import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { sendEmail, passwordResetEmailHtml } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })

    await connectDB()
    const user = await User.findOne({ email })

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true, message: 'If this email exists, a reset link has been sent' })

    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = token
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000) // 15 min
    await user.save()

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`
    await sendEmail(email, 'Reset your SkillCraft password', passwordResetEmailHtml(resetUrl, user.firstName))

    return NextResponse.json({ success: true, message: 'Reset link sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
