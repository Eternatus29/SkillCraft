import { NextRequest, NextResponse } from 'next/server'
import otpGenerator from 'otp-generator'
import { connectDB } from '@/lib/db'
import OTP from '@/models/OTP'
import User from '@/models/User'
import { sendEmail, otpEmailHtml } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })

    await connectDB()

    if (await User.findOne({ email })) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 })
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
    await OTP.create({ email, otp })

    await sendEmail(email, 'Your SkillCraft OTP', otpEmailHtml(otp, email.split('@')[0]))

    return NextResponse.json({ success: true, message: 'OTP sent to your email' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
  }
}
