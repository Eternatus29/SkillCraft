'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronDown, ArrowLeft, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SubSection {
  _id: string
  title: string
  timeDuration: number
  description?: string
  videoUrl: string
}

interface Section {
  _id: string
  title: string
  subSections: SubSection[]
}

interface Course {
  _id: string
  title: string
  sections: Section[]
}

interface Progress {
  completedVideos: string[]
}

export default function CourseViewer({ course, progress }: { course: Course; progress: Progress | null }) {
  const allSubs = course.sections.flatMap(s => s.subSections)
  const [currentSub, setCurrentSub] = useState<SubSection | null>(allSubs[0] ?? null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(progress?.completedVideos ?? [])
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function markComplete(subId: string) {
    if (completedIds.has(subId)) return
    startTransition(async () => {
      const res = await fetch('/api/course-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course._id, subSectionId: subId }),
      })
      if (res.ok) {
        setCompletedIds(prev => new Set([...prev, subId]))
        toast.success('Lesson marked as complete!')
      }
    })
  }

  const totalLessons = allSubs.length
  const completedCount = allSubs.filter(s => completedIds.has(s._id)).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <Link href="/dashboard/enrolled-courses" className="flex items-center gap-2 text-gray-300 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-white font-semibold text-sm truncate max-w-xs">{course.title}</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
            <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
            <span>{progressPct}%</span>
          </div>
          <button onClick={() => setSidebarOpen(o => !o)} className="md:hidden text-gray-300 hover:text-white">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <main className="flex-1 overflow-y-auto">
          {currentSub ? (
            <div>
              {currentSub.videoUrl ? (
                <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
                  <video
                    key={currentSub.videoUrl}
                    src={currentSub.videoUrl}
                    controls
                    className="absolute inset-0 w-full h-full"
                    onEnded={() => markComplete(currentSub._id)}
                  />
                </div>
              ) : (
                <div className="bg-gray-900 flex items-center justify-center" style={{ paddingTop: '56.25%' }}>
                  <p className="text-gray-400 text-sm">No video available</p>
                </div>
              )}
              <div className="p-6 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentSub.title}</h2>
                    {currentSub.description && (
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed">{currentSub.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => markComplete(currentSub._id)}
                    disabled={isPending || completedIds.has(currentSub._id)}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg shrink-0 transition-colors',
                      completedIds.has(currentSub._id)
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60'
                    )}
                  >
                    {completedIds.has(currentSub._id) ? (
                      <><CheckCircle2 className="w-4 h-4" /> Completed</>
                    ) : (
                      'Mark Complete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Select a lesson to start</p>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className={cn(
          'w-80 shrink-0 bg-gray-900 border-l border-gray-800 overflow-y-auto transition-all',
          'hidden md:block',
          sidebarOpen && '!block fixed inset-0 left-auto z-50'
        )}>
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Course Content</h3>
            <p className="text-gray-400 text-xs mt-0.5">{completedCount}/{totalLessons} lessons completed</p>
          </div>
          {course.sections.map((section) => (
            <details key={section._id} open className="border-b border-gray-800">
              <summary className="px-4 py-3 text-sm font-medium text-gray-300 cursor-pointer hover:bg-gray-800 flex items-center justify-between list-none">
                <span className="line-clamp-1">{section.title}</span>
                <ChevronDown className="w-4 h-4 shrink-0" />
              </summary>
              <ul>
                {section.subSections.map((sub) => {
                  const isDone = completedIds.has(sub._id)
                  const isCurrent = currentSub?._id === sub._id
                  return (
                    <li key={sub._id}>
                      <button
                        onClick={() => { setCurrentSub(sub); setSidebarOpen(false) }}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-left text-xs transition-colors',
                          isCurrent ? 'bg-violet-900/40 text-violet-300' : 'text-gray-400 hover:bg-gray-800'
                        )}
                      >
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          : <Circle className="w-4 h-4 shrink-0 mt-0.5" />}
                        <span className="line-clamp-2">{sub.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </details>
          ))}
        </aside>
      </div>
    </div>
  )
}
