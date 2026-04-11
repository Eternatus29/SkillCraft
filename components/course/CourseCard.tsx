import Link from 'next/link'
import Image from 'next/image'
import { Users, Clock } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { formatDuration, formatPrice } from '@/lib/utils'
import type { CourseCardData } from '@/types'

interface CourseCardProps {
  course: CourseCardData
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course._id}`}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-bold">
            {course.title[0]}
          </div>
        )}
        <span className="absolute top-2 left-2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          {course.category?.name}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-violet-700 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500">
          {course.instructor?.firstName} {course.instructor?.lastName}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <StarRating rating={course.averageRating} size={12} />
          <span className="text-xs font-semibold text-gray-700">
            {course.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">({course.numberOfEnrolledStudents})</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {course.numberOfEnrolledStudents.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDuration(course.totalDuration)}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <span className="font-bold text-gray-900 text-base">
            {formatPrice(course.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
