import mongoose, { Document, Schema } from 'mongoose'

export interface ISubSection extends Document {
  title: string
  timeDuration: number
  description?: string
  videoUrl: string
}

const SubSectionSchema = new Schema<ISubSection>({
  title: { type: String, required: true, trim: true },
  timeDuration: { type: Number, required: true, default: 0 },
  description: { type: String },
  videoUrl: { type: String, required: true },
})

export default mongoose.models.SubSection ||
  mongoose.model<ISubSection>('SubSection', SubSectionSchema)
