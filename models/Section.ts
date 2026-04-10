import mongoose, { Document, Schema } from 'mongoose'
import type { ISubSection } from './SubSection'

export interface ISection extends Document {
  title: string
  subSections: mongoose.Types.ObjectId[] | ISubSection[]
}

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true, trim: true },
  subSections: [{ type: Schema.Types.ObjectId, ref: 'SubSection' }],
})

export default mongoose.models.Section ||
  mongoose.model<ISection>('Section', SectionSchema)
