'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

interface CategoryOption {
    _id: string
    name: string
}

interface CourseData {
    _id: string
    title: string
    description: string
    whatYouWillLearn: string
    price: number
    category: string
    tags: string[]
    instructions: string[]
    status: 'Draft' | 'Published'
}

interface EditCourseClientProps {
    categories: CategoryOption[]
    course: CourseData
}

export default function EditCourseClient({ categories, course }: EditCourseClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [info, setInfo] = useState({
        title: course.title ?? '',
        description: course.description ?? '',
        whatYouWillLearn: course.whatYouWillLearn ?? '',
        price: String(course.price ?? 0),
        category: String(course.category ?? ''),
        tags: (course.tags ?? []).join(', '),
        instructions: (course.instructions ?? []).join('\n'),
        status: (course.status ?? 'Draft') as 'Draft' | 'Published',
    })

    function submit() {
        if (!info.title || !info.description || !info.category) {
            toast.error('Please fill in all required fields')
            return
        }

        startTransition(async () => {
            const res = await fetch(`/api/courses/${course._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: info.title,
                    description: info.description,
                    whatYouWillLearn: info.whatYouWillLearn,
                    price: Number(info.price),
                    category: info.category,
                    tags: info.tags.split(',').map(t => t.trim()).filter(Boolean),
                    instructions: info.instructions.split('\n').map(i => i.trim()).filter(Boolean),
                    status: info.status,
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                toast.error(data.message ?? 'Failed to update course')
                return
            }

            toast.success('Course updated successfully')
            router.push('/dashboard/my-courses')
            router.refresh()
        })
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/dashboard/my-courses')}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to My Courses
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
                <p className="text-sm text-gray-500 mt-1">Update your course details and publishing status.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title *</label>
                    <input
                        value={info.title}
                        onChange={e => setInfo(p => ({ ...p, title: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                    <textarea
                        value={info.description}
                        onChange={e => setInfo(p => ({ ...p, description: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">What students will learn</label>
                    <textarea
                        value={info.whatYouWillLearn}
                        onChange={e => setInfo(p => ({ ...p, whatYouWillLearn: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                        <select
                            value={info.category}
                            onChange={e => setInfo(p => ({ ...p, category: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">Select category</option>
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
                        <input
                            type="number"
                            min={0}
                            value={info.price}
                            onChange={e => setInfo(p => ({ ...p, price: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
                        <input
                            value={info.tags}
                            onChange={e => setInfo(p => ({ ...p, tags: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                        <select
                            value={info.status}
                            onChange={e => setInfo(p => ({ ...p, status: e.target.value as 'Draft' | 'Published' }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Requirements (one per line)</label>
                    <textarea
                        value={info.instructions}
                        onChange={e => setInfo(p => ({ ...p, instructions: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={submit}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
