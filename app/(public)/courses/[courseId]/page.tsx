import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Users, Clock, Star, CheckCircle2, BookOpen, ChevronDown } from 'lucide-react'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import { getSession } from '@/lib/session'
import { formatDuration, formatPrice } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import EnrollButton from './EnrollButton'
import type { CourseDetailData } from '@/types'

interface Props { params: Promise<{ courseId: string }> }

async function getCourse(id: string): Promise<CourseDetailData | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null

  try {
    await connectDB()
    let course: any = null

    try {
      course = await Course.findById(id)
        .populate('instructor', 'firstName lastName avatar')
        .populate('category', 'name')
        .populate({
          path: 'sections',
          populate: { path: 'subSections', select: 'title timeDuration' },
        })
        .populate({ path: 'reviews', populate: { path: 'user', select: 'firstName lastName avatar' } })
        .lean()
    } catch (error) {
      // Fallback query to avoid false 404s when nested refs are malformed.
      console.error('Course deep populate failed, using fallback query:', error)
      course = await Course.findById(id)
        .populate('instructor', 'firstName lastName avatar')
        .populate('category', 'name')
        .lean()
    }

    if (!course) return null

    const safeCourse = {
      ...course,
      averageRating: Number(course.averageRating ?? 0),
      numberOfEnrolledStudents: Number(course.numberOfEnrolledStudents ?? 0),
      totalDuration: Number(course.totalDuration ?? 0),
      sections: Array.isArray(course.sections) ? course.sections : [],
      reviews: Array.isArray(course.reviews) ? course.reviews : [],
      instructions: Array.isArray(course.instructions) ? course.instructions : [],
      studentsEnrolled: Array.isArray(course.studentsEnrolled) ? course.studentsEnrolled : [],
    }

    return JSON.parse(JSON.stringify(safeCourse))
  } catch (error) {
    console.error('Get course failed:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params
  const course = await getCourse(courseId)
  return { title: course?.title ?? 'Course Not Found' }
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params
  const [course, session] = await Promise.all([getCourse(courseId), getSession()])
  if (!course) notFound()

  const isEnrolled = session && course.studentsEnrolled?.includes(session.id as any)
  const totalLessons = course.sections?.reduce((s: number, sec: any) => s + (sec.subSections?.length ?? 0), 0) ?? 0

  return (
    <div>
      {/* Hero banner */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <span className="text-xs bg-violet-600 text-white px-2.5 py-1 rounded-full font-medium">
              {(course.category as any)?.name}
            </span>
            <h1 className="text-3xl font-bold mt-3 mb-3 leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {course.averageRating.toFixed(1)} ({course.reviews?.length ?? 0} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {course.numberOfEnrolledStudents.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {formatDuration(course.totalDuration)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {totalLessons} lessons
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              By <span className="text-white font-medium">{(course.instructor as any)?.firstName} {(course.instructor as any)?.lastName}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.whatYouWillLearn?.split('\n').filter(Boolean).map((item, i) => (
                  <div key={`${item}-${i}`} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Course curriculum */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Course Curriculum</h2>
              <div className="space-y-2">
                {course.sections?.map((section: any, si: number) => (
                  <details key={String(section?._id ?? section ?? si)} className="bg-white border border-gray-100 rounded-xl overflow-hidden group">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-violet-500 shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">{section.title ?? `Section ${si + 1}`}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                        <span>{section.subSections?.length ?? 0} lessons</span>
                        <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                      </div>
                    </summary>
                    <ul className="border-t border-gray-100">
                      {section.subSections?.map((sub: any, ssi: number) => (
                        <li key={String(sub?._id ?? `${si}-${ssi}`)} className="flex items-center justify-between px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                            {sub.title}
                          </span>
                          <span className="text-xs text-gray-400">{formatDuration(sub.timeDuration)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>

            {/* Requirements */}
            {course.instructions?.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.instructions.map((req, i) => (
                    <li key={`${req}-${i}`} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-2 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Reviews */}
            {course.reviews?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {(course.reviews as any[]).slice(0, 5).map((r, i) => (
                    <div key={String(r?._id ?? `${r?.user?._id ?? 'user'}-${i}`)} className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-center gap-3 mb-2">
                        {r.user?.avatar ? (
                          <img src={r.user.avatar} className="w-8 h-8 rounded-full" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center font-semibold">
                            {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{r.user?.firstName} {r.user?.lastName}</p>
                          <StarRating rating={r.rating} size={12} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{r.review}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sticky purchase card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {course.thumbnail && (
                <div className="relative aspect-video">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="text-3xl font-bold text-gray-900 mb-4">{formatPrice(course.price)}</p>
                <EnrollButton
                  courseId={course._id}
                  courseTitle={course.title}
                  thumbnail={course.thumbnail}
                  price={course.price}
                  instructor={course.instructor as any}
                  category={course.category as any}
                  isEnrolled={!!isEnrolled}
                  isLoggedIn={!!session}
                />
                <ul className="mt-5 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-violet-500" />{formatDuration(course.totalDuration)} total</li>
                  <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-500" />{totalLessons} lessons</li>
                  <li className="flex items-center gap-2"><Users className="w-4 h-4 text-violet-500" />Full lifetime access</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
