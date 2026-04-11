import Link from 'next/link'
import { ArrowRight, BookOpen, Users, Star, Zap, Shield, Globe, TrendingUp } from 'lucide-react'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import Category from '@/models/Category'
import Review from '@/models/Review'
import CourseCard from '@/components/course/CourseCard'
import type { CourseCardData } from '@/types'

async function getFeaturedCourses(): Promise<CourseCardData[]> {
  try {
    await connectDB()
    const courses = await Course.find({ status: 'Published' })
      .populate('instructor', 'firstName lastName avatar')
      .populate('category', 'name')
      .sort({ numberOfEnrolledStudents: -1 })
      .limit(8)
      .lean()
    return JSON.parse(JSON.stringify(courses))
  } catch {
    return []
  }
}

async function getStats() {
  try {
    await connectDB()
    const [courses, reviews] = await Promise.all([
      Course.countDocuments({ status: 'Published' }),
      Review.countDocuments(),
    ])
    return { courses, reviews }
  } catch {
    return { courses: 0, reviews: 0 }
  }
}

async function getCategories() {
  try {
    await connectDB()
    return await Category.find().lean()
  } catch {
    return []
  }
}

const features = [
  { icon: Zap, title: 'Learn at Your Pace', desc: 'Access course content anytime, anywhere, on any device.' },
  { icon: Shield, title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience.' },
  { icon: Globe, title: 'Global Community', desc: 'Join thousands of learners worldwide and grow together.' },
  { icon: TrendingUp, title: 'Career Growth', desc: 'Build in-demand skills that employers are looking for.' },
]

export default async function HomePage() {
  const [courses, stats, categories] = await Promise.all([
    getFeaturedCourses(),
    getStats(),
    getCategories(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(167,139,250,0.15)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-violet-700/40 text-violet-200 text-sm px-4 py-1.5 rounded-full mb-6 font-medium">
              <Star className="w-3.5 h-3.5 fill-violet-300 text-violet-300" />
              Trusted by thousands of learners
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Build Skills That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300">
                Open Doors
              </span>
            </h1>
            <p className="text-lg text-violet-200 mb-8 leading-relaxed max-w-xl">
              Discover expert-led courses in programming, design, business, and more. Learn at your own pace and accelerate your career.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="flex items-center gap-2 bg-white text-violet-800 font-semibold px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors"
              >
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup?role=Instructor"
                className="flex items-center gap-2 border border-violet-400 text-white font-semibold px-6 py-3 rounded-xl hover:bg-violet-700/30 transition-colors"
              >
                Teach on SkillCraft
              </Link>
            </div>
          </div>
        </div>

        {/* Stat bar */}
        <div className="relative bg-violet-950/60 border-t border-violet-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-3 gap-6 text-center sm:flex sm:justify-around">
            <div>
              <p className="text-2xl font-bold text-white">{stats.courses}+</p>
              <p className="text-xs text-violet-300 mt-0.5">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.reviews}+</p>
              <p className="text-xs text-violet-300 mt-0.5">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.8</p>
              <p className="text-xs text-violet-300 mt-0.5">Avg. Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat: any) => (
              <Link
                key={cat._id}
                href={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:border-violet-400 hover:text-violet-700 transition-colors shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Courses</h2>
          <Link href="/courses" className="flex items-center gap-1 text-sm text-violet-600 font-medium hover:text-violet-800">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No courses yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why SkillCraft?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-violet-700 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-violet-200 mb-8 text-lg">
            Join thousands of learners already growing their skills on SkillCraft.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-colors"
          >
            Get Started for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
