import mongoose, { Document, Schema } from 'mongoose'
import type { IProfile } from './Profile'

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'Student' | 'Instructor' | 'Admin'
  avatar?: string
  active: boolean
  approved: boolean
  profile?: mongoose.Types.ObjectId | IProfile
  courses: mongoose.Types.ObjectId[]
  courseProgress: mongoose.Types.ObjectId[]
  reviews: mongoose.Types.ObjectId[]
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['Student', 'Instructor', 'Admin'],
      required: true,
    },
    avatar: { type: String },
    active: { type: Boolean, default: true },
    approved: { type: Boolean, default: true },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    courseProgress: [{ type: Schema.Types.ObjectId, ref: 'CourseProgress' }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema)
