import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import { PlusCircle, Edit2, Trash2, Users, BookOpen } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import DeleteCourseButton from './DeleteCourseButton'

export const metadata: Metadata = { title: 'My Courses' }

async function getCourses(instructorId: string) {
  await connectDB()
  const courses = await Course.find({ instructor: instructorId })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .lean()
  return JSON.parse(JSON.stringify(courses))
}

export default async function MyCoursesPage() {
  const session = await getSession()
  if (!session || session.role !== 'Instructor') redirect('/dashboard')
  const courses = await getCourses(session.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 text-sm mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/add-course" className="flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-violet-700">
          <PlusCircle className="w-4 h-4" /> New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-gray-700 mb-2">No courses yet</p>
          <p className="text-sm text-gray-500 mb-6">Create your first course and start teaching.</p>
          <Link href="/dashboard/add-course" className="bg-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700">
            Create Course
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course: any) => (
            <div key={course._id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex gap-4 p-4 items-center">
              <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl font-bold">{course.title[0]}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{course.category?.name}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.numberOfEnrolledStudents}</span>
                  <span>{formatPrice(course.price)}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${course.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{course.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/dashboard/edit-course/${course._id}`} className="p-2 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <DeleteCourseButton courseId={course._id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
