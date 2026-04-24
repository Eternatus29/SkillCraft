import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Analytics' }

async function getInstructorAnalytics(userId: string) {
    await connectDB()

    const courses = await Course.find({ instructor: userId })
        .select('title status price numberOfEnrolledStudents averageRating createdAt')
        .sort({ createdAt: -1 })
        .lean()

    const publishedCourses = courses.filter((c: any) => c.status === 'Published')
    const totalStudents = courses.reduce((sum: number, c: any) => sum + Number(c.numberOfEnrolledStudents ?? 0), 0)
    const totalRevenue = courses.reduce(
        (sum: number, c: any) => sum + Number(c.price ?? 0) * Number(c.numberOfEnrolledStudents ?? 0),
        0
    )
    const avgRating = publishedCourses.length
        ? publishedCourses.reduce((sum: number, c: any) => sum + Number(c.averageRating ?? 0), 0) / publishedCourses.length
        : 0

    return { courses: JSON.parse(JSON.stringify(courses)), totalStudents, totalRevenue, avgRating }
}

export default async function AnalyticsPage() {
    const session = await getSession()
    if (!session) redirect('/login?redirect=/dashboard/analytics')
    if (session.role !== 'Instructor') redirect('/dashboard')

    const { courses, totalStudents, totalRevenue, avgRating } = await getInstructorAnalytics(session.id)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Track your course performance and revenue.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <p className="text-xs text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <p className="text-xs text-gray-500">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{avgRating.toFixed(1)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left font-semibold px-4 py-3">Course</th>
                                <th className="text-left font-semibold px-4 py-3">Status</th>
                                <th className="text-left font-semibold px-4 py-3">Students</th>
                                <th className="text-left font-semibold px-4 py-3">Price</th>
                                <th className="text-left font-semibold px-4 py-3">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No courses found.</td>
                                </tr>
                            ) : (
                                courses.map((course: any) => (
                                    <tr key={course._id} className="border-b border-gray-100 last:border-0">
                                        <td className="px-4 py-3 font-medium text-gray-900">{course.title}</td>
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
