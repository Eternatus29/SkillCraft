import mongoose, { Document, Schema } from 'mongoose'

export interface IProfile extends Document {
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say' | 'Other'
  dob?: Date
  about?: string
  contactNumber?: string
}

const ProfileSchema = new Schema<IProfile>({
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'],
  },
  dob: { type: Date },
  about: { type: String },
  contactNumber: {
    type: String,
    validate: {
      validator: (v: string) => !v || /^\d{10}$/.test(v),
      message: 'Contact number must be 10 digits',
    },
  },
})

export default mongoose.models.Profile ||
  mongoose.model<IProfile>('Profile', ProfileSchema)
