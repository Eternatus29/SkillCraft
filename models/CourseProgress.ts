import mongoose, { Document, Schema } from 'mongoose'

export interface ICourseProgress extends Document {
  courseId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  completedVideos: mongoose.Types.ObjectId[]
}

const CourseProgressSchema = new Schema<ICourseProgress>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  completedVideos: [{ type: Schema.Types.ObjectId, ref: 'SubSection' }],
})

export default mongoose.models.CourseProgress ||
  mongoose.model<ICourseProgress>('CourseProgress', CourseProgressSchema)
