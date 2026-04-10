import mongoose, { Document, Schema } from 'mongoose'

export interface IReview extends Document {
  review: string
  rating: number
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  },
  { timestamps: true }
)

ReviewSchema.post('save', async function () {
  await updateCourseRating(this.course)
})

ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateCourseRating(doc.course)
})

async function updateCourseRating(courseId: mongoose.Types.ObjectId) {
  const Course = mongoose.model('Course')
  const result = await mongoose.model('Review').aggregate([
    { $match: { course: courseId } },
    { $group: { _id: '$course', avg: { $avg: '$rating' } } },
  ])
  const avg = result[0]?.avg ?? 0
  await Course.findByIdAndUpdate(courseId, {
    averageRating: Math.round(avg * 10) / 10,
  })
}

export default mongoose.models.Review ||
  mongoose.model<IReview>('Review', ReviewSchema)
