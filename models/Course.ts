import mongoose, { Document, Schema } from 'mongoose'

export interface ICourse extends Document {
  title: string
  description: string
  whatYouWillLearn: string
  instructor: mongoose.Types.ObjectId
  price: number
  tags: string[]
  thumbnail: string
  category: mongoose.Types.ObjectId
  averageRating: number
  numberOfEnrolledStudents: number
  sections: mongoose.Types.ObjectId[]
  totalDuration: number
  reviews: mongoose.Types.ObjectId[]
  studentsEnrolled: mongoose.Types.ObjectId[]
  instructions: string[]
  status: 'Draft' | 'Published'
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    whatYouWillLearn: { type: String, required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true, min: 0 },
    tags: [{ type: String }],
    thumbnail: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    averageRating: { type: Number, default: 0 },
    numberOfEnrolledStudents: { type: Number, default: 0 },
    sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
    totalDuration: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    studentsEnrolled: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    instructions: [{ type: String }],
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  },
  { timestamps: true }
)

export default mongoose.models.Course ||
  mongoose.model<ICourse>('Course', CourseSchema)
