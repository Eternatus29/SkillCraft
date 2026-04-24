import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'

export const metadata: Metadata = { title: 'Manage Reviews' }

async function getReviews() {
    await connectDB()
    const reviews = await Review.find()
        .populate('user', 'firstName lastName')
        .populate('course', 'title')
        .select('review rating user course createdAt')
        .sort({ createdAt: -1 })
        .lean()
    return JSON.parse(JSON.stringify(reviews))
}

export default async function ReviewsPage() {
    const session = await getSession()
    if (!session) redirect('/login?redirect=/dashboard/reviews')
    if (session.role !== 'Admin') redirect('/dashboard')

    const reviews = await getReviews()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
                <p className="text-sm text-gray-500 mt-1">See all learner feedback across courses.</p>
            </div>

            <div className="space-y-3">
                {reviews.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">No reviews found.</div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review._id} className="bg-white rounded-xl border border-gray-100 p-5">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900">{review.user?.firstName} {review.user?.lastName}</span>
                                <span className="text-gray-400">on</span>
                                <span className="text-violet-700 font-medium">{review.course?.title ?? 'Unknown course'}</span>
                                <span className="ml-auto inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700">
                                    {Number(review.rating ?? 0).toFixed(1)} / 5
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{review.review}</p>
                            <p className="text-xs text-gray-400 mt-3">{new Date(review.createdAt).toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
