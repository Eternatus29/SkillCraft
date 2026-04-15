import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import CourseProgress from '@/models/CourseProgress'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Play, BookOpen } from 'lucide-react'

export const metadata: Metadata = { title: 'My Learning' }

async function getEnrolledCourses(userId: string) {
  await connectDB()
  const user = await User.findById(userId)
    .populate({
      path: 'courses',
      populate: [
        { path: 'instructor', select: 'firstName lastName' },
        { path: 'category', select: 'name' },
        { path: 'sections', populate: { path: 'subSections', select: '_id' } },
      ],
    })
    .lean()

  const progresses = await CourseProgress.find({ userId }).lean()
  const progressMap: Record<string, string[]> = {}
  progresses.forEach((p: any) => {
    progressMap[p.courseId.toString()] = p.completedVideos.map((v: any) => v.toString())
  })

  return { courses: user?.courses ?? [], progressMap }
}

export default async function EnrolledCoursesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { courses, progressMap } = await getEnrolledCourses(session.id)

  const totalLessons = (course: any) =>
    course.sections?.reduce((s: number, sec: any) => s + (sec.subSections?.length ?? 0), 0) ?? 0

  const completedLessons = (courseId: string, course: any) => {
    const ids = progressMap[courseId] ?? []
    return course.sections?.reduce((s: number, sec: any) =>
      s + (sec.subSections?.filter((sub: any) => ids.includes(sub._id.toString()))?.length ?? 0), 0) ?? 0
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Learning</h1>
      <p className="text-gray-500 text-sm mb-8">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</p>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-gray-700 mb-2">No courses yet</p>
          <p className="text-sm text-gray-500 mb-6">Start learning by enrolling in a course.</p>
          <Link href="/courses" className="bg-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(courses as any[]).map((course) => {
            const total = totalLessons(course)
            const completed = completedLessons(course._id.toString(), course)
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0
            return (
              <div key={course._id.toString()} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="relative aspect-video bg-gray-100">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-bold">{course.title[0]}</div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-500">{course.instructor?.firstName} {course.instructor?.lastName}</p>
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>{completed}/{total} lessons</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Link
                    href={`/view-course/${course._id.toString()}`}
                    className="mt-2 flex items-center justify-center gap-2 bg-violet-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-violet-700"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {pct > 0 ? 'Continue' : 'Start'} Learning
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
