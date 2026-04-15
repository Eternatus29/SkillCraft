import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Course from '@/models/Course'
import CourseProgress from '@/models/CourseProgress'
import { BookOpen, Users, DollarSign, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

async function getStudentDashboard(userId: string) {
  await connectDB()
  const user = await User.findById(userId).populate({ path: 'courses', select: 'title thumbnail totalDuration', populate: { path: 'category', select: 'name' } }).lean()
  const progresses = await CourseProgress.find({ userId }).lean()
  return { enrolledCount: user?.courses?.length ?? 0, progresses }
}

async function getInstructorDashboard(userId: string) {
  await connectDB()
  const courses = await Course.find({ instructor: userId, status: 'Published' }).lean()
  const totalStudents = courses.reduce((s, c) => s + c.numberOfEnrolledStudents, 0)
  const totalRevenue = courses.reduce((s, c) => s + c.price * c.numberOfEnrolledStudents, 0)
  const avgRating = courses.length ? courses.reduce((s, c) => s + c.averageRating, 0) / courses.length : 0
  return { totalCourses: courses.length, totalStudents, totalRevenue, avgRating }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  if (session.role === 'Student') {
    const { enrolledCount } = await getStudentDashboard(session.id)
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {session.firstName}!</h1>
        <p className="text-gray-500 text-sm mb-8">Keep learning and growing.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard icon={BookOpen} label="Enrolled Courses" value={enrolledCount} color="violet" />
          <StatCard icon={TrendingUp} label="In Progress" value={enrolledCount} color="blue" />
          <StatCard icon={Star} label="Completed" value={0} color="green" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700">Browse Courses</Link>
            <Link href="/dashboard/enrolled-courses" className="text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">My Learning</Link>
            <Link href="/dashboard/cart" className="text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">View Cart</Link>
          </div>
        </div>
      </div>
    )
  }

  if (session.role === 'Instructor') {
    const stats = await getInstructorDashboard(session.id)
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Instructor Dashboard</h1>
        <p className="text-gray-500 text-sm mb-8">Hi {session.firstName}, here&apos;s your performance overview.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={BookOpen} label="Published Courses" value={stats.totalCourses} color="violet" />
          <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="blue" />
          <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(stats.totalRevenue)} color="green" />
          <StatCard icon={Star} label="Avg. Rating" value={stats.avgRating.toFixed(1)} color="yellow" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/add-course" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700">+ New Course</Link>
            <Link href="/dashboard/my-courses" className="text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">My Courses</Link>
          </div>
        </div>
      </div>
    )
  }

  redirect('/')
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = { violet: 'bg-violet-100 text-violet-600', blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', yellow: 'bg-yellow-100 text-yellow-600' }
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
