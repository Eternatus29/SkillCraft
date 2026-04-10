import mongoose, { Document, Schema } from 'mongoose'

export interface IOTP extends Document {
  email: string
  otp: string
  createdAt: Date
}

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
})

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)
