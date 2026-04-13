import type { Metadata } from 'next'
import { connectDB } from '@/lib/db'
import Course from '@/models/Course'
import Category from '@/models/Category'
import CourseCard from '@/components/course/CourseCard'
import CoursesFilter from './CoursesFilter'
import type { CourseCardData } from '@/types'

export const metadata: Metadata = { title: 'Browse Courses' }

interface SearchParams {
  category?: string
  search?: string
  sort?: string
}

async function getCourses(params: SearchParams): Promise<CourseCardData[]> {
  await connectDB()
  const filter: Record<string, unknown> = { status: 'Published' }
  if (params.search) {
    filter.title = { $regex: params.search, $options: 'i' }
  }
  if (params.category) {
    const cat = await Category.findOne({ name: params.category })
    if (cat) filter.category = cat._id
  }
  const sortMap: Record<string, Record<string, number>> = {
    popular: { numberOfEnrolledStudents: -1 },
    rating: { averageRating: -1 },
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  }
  const sort = sortMap[params.sort ?? 'popular'] ?? { numberOfEnrolledStudents: -1 }

  const courses = await Course.find(filter)
    .populate('instructor', 'firstName lastName avatar')
    .populate('category', 'name')
    .sort(sort)
    .lean()
  return JSON.parse(JSON.stringify(courses))
}

async function getCategories() {
  await connectDB()
  return Category.find().lean()
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [courses, categories] = await Promise.all([getCourses(params), getCategories()])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="text-gray-500 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar */}
        <aside className="lg:w-60 shrink-0">
          <CoursesFilter categories={categories.map((c: any) => c.name)} activeCategory={params.category} activeSort={params.sort} search={params.search} />
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.map((c) => <CourseCard key={c._id} course={c} />)}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-500">
              <p className="text-lg font-medium">No courses found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
