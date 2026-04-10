import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document {
  name: string
  description?: string
  courses: mongoose.Types.ObjectId[]
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
})

export default mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema)
