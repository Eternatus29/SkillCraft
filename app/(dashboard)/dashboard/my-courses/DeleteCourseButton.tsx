'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('Delete this course? This cannot be undone.')) return
    startTransition(async () => {
      const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Failed to delete'); return }
      toast.success('Course deleted')
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
