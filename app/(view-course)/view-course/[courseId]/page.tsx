import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import CourseProgress from '@/models/CourseProgress'
import CourseViewer from './CourseViewer'

async function getCourseData(courseId: string, userId: string) {
  await connectDB()
  const course = await Course.findById(courseId)
    .populate({ path: 'sections', populate: { path: 'subSections' } })
    .lean()

  if (!course) return null

  const isEnrolled = (course as any).studentsEnrolled?.some(
    (s: any) => s.toString() === userId
  )
  if (!isEnrolled) return null

  const progress = await CourseProgress.findOne({ courseId, userId }).lean()
  return { course: JSON.parse(JSON.stringify(course)), progress: JSON.parse(JSON.stringify(progress)) }
}

interface Props { params: Promise<{ courseId: string }> }

export default async function ViewCoursePage({ params }: Props) {
  const { courseId } = await params
  const session = await getSession()
  if (!session) redirect(`/login?redirect=/view-course/${courseId}`)

  const data = await getCourseData(courseId, session.id)
  if (!data) notFound()

  return <CourseViewer course={data.course} progress={data.progress} />
}
