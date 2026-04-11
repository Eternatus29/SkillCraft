import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
}

export default function StarRating({ rating, max = 5, size = 14 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'}
        />
      ))}
    </div>
  )
}
