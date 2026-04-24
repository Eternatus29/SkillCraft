import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Manage Courses' }

async function getCourses() {
    await connectDB()
    const courses = await Course.find()
        .populate('instructor', 'firstName lastName')
        .populate('category', 'name')
        .select('title status price averageRating numberOfEnrolledStudents instructor category createdAt')
        .sort({ createdAt: -1 })
        .lean()
    return JSON.parse(JSON.stringify(courses))
}

export default async function CoursesPage() {
    const session = await getSession()
    if (!session) redirect('/login?redirect=/dashboard/courses')
    if (session.role !== 'Admin') redirect('/dashboard')

    const courses = await getCourses()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                <p className="text-sm text-gray-500 mt-1">Review all courses on the platform.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left font-semibold px-4 py-3">Title</th>
                                <th className="text-left font-semibold px-4 py-3">Instructor</th>
                                <th className="text-left font-semibold px-4 py-3">Category</th>
                                <th className="text-left font-semibold px-4 py-3">Status</th>
                                <th className="text-left font-semibold px-4 py-3">Students</th>
                                <th className="text-left font-semibold px-4 py-3">Price</th>
                                <th className="text-left font-semibold px-4 py-3">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No courses found.</td>
                                </tr>
                            ) : (
                                courses.map((course: any) => (
                                    <tr key={course._id} className="border-b border-gray-100 last:border-0">
                                        <td className="px-4 py-3 font-medium text-gray-900">{course.title}</td>
                                        <td className="px-4 py-3 text-gray-600">{course.instructor?.firstName} {course.instructor?.lastName}</td>
                                        <td className="px-4 py-3 text-gray-600">{course.category?.name ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${course.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{course.numberOfEnrolledStudents ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatPrice(course.price ?? 0)}</td>
                                        <td className="px-4 py-3 text-gray-600">{Number(course.averageRating ?? 0).toFixed(1)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
