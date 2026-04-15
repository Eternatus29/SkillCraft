'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronRight, ChevronLeft, Upload, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

type Step = 1 | 2 | 3

interface SectionDraft {
  title: string
  subSections: { title: string; description: string; videoFile?: File | null }[]
}

export default function AddCourseClient({ categories }: { categories: { _id: string; name: string }[] }) {
  const [step, setStep] = useState<Step>(1)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Step 1 state
  const [info, setInfo] = useState({ title: '', description: '', whatYouWillLearn: '', price: '', category: '', tags: '', instructions: '', status: 'Draft' as 'Draft' | 'Published' })
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)

  // Step 2 state
  const [sections, setSections] = useState<SectionDraft[]>([{ title: '', subSections: [{ title: '', description: '' }] }])

  function addSection() {
    setSections(s => [...s, { title: '', subSections: [{ title: '', description: '' }] }])
  }

  function removeSection(si: number) {
    setSections(s => s.filter((_, i) => i !== si))
  }

  function addSubSection(si: number) {
    setSections(s => s.map((sec, i) => i === si ? { ...sec, subSections: [...sec.subSections, { title: '', description: '' }] } : sec))
  }

  function removeSubSection(si: number, ssi: number) {
    setSections(s => s.map((sec, i) => i === si ? { ...sec, subSections: sec.subSections.filter((_, j) => j !== ssi) } : sec))
  }

  function updateSection(si: number, title: string) {
    setSections(s => s.map((sec, i) => i === si ? { ...sec, title } : sec))
  }

  function updateSubSection(si: number, ssi: number, field: string, value: string | File | null) {
    setSections(s => s.map((sec, i) => i === si ? {
      ...sec,
      subSections: sec.subSections.map((sub, j) => j === ssi ? { ...sub, [field]: value } : sub),
    } : sec))
  }

  function submitStep1() {
    if (!info.title || !info.description || !info.category) {
      toast.error('Please fill in all required fields')
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      Object.entries(info).forEach(([k, v]) => fd.append(k, v))
      if (thumbnail) fd.append('thumbnail', thumbnail)
      fd.set('tags', JSON.stringify(info.tags.split(',').map(t => t.trim()).filter(Boolean)))
      fd.set('instructions', JSON.stringify(info.instructions.split('\n').filter(Boolean)))
      fd.set('price', String(Number(info.price)))

      const res = await fetch('/api/courses', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Failed to create course'); return }
      setCourseId(data.data._id)
      toast.success('Course info saved!')
      setStep(2)
    })
  }

  function submitStep2() {
    if (sections.some(s => !s.title)) { toast.error('All sections need a title'); return }
    startTransition(async () => {
      for (const section of sections) {
        const secRes = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: section.title, courseId }),
        })
        const secData = await secRes.json()
        if (!secRes.ok) { toast.error('Failed to create section'); return }
        const sectionId = secData.data._id

        for (const sub of section.subSections) {
          if (!sub.title) continue
          const fd = new FormData()
          fd.append('title', sub.title)
          fd.append('description', sub.description)
          fd.append('sectionId', sectionId)
          if (sub.videoFile) fd.append('video', sub.videoFile)
          const subRes = await fetch('/api/subsections', { method: 'POST', body: fd })
          if (!subRes.ok) { toast.error('Failed to create lesson'); return }
        }
      }
      toast.success('Curriculum saved!')
      setStep(3)
    })
  }

  function publish(status: 'Draft' | 'Published') {
    startTransition(async () => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message ?? 'Failed'); return }
      toast.success(status === 'Published' ? 'Course published! 🎉' : 'Saved as draft')
      router.push('/dashboard/my-courses')
    })
  }

  const steps = [
    { n: 1, label: 'Course Info' },
    { n: 2, label: 'Curriculum' },
    { n: 3, label: 'Publish' },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Course</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${step === s.n ? 'bg-violet-600 text-white' : step > s.n ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === s.n ? 'bg-white text-violet-600' : step > s.n ? 'bg-violet-600 text-white' : 'bg-gray-300 text-gray-600'}`}>{s.n}</span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Course Info */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title *</label>
            <input value={info.title} onChange={e => setInfo(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Complete JavaScript Course" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={info.description} onChange={e => setInfo(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="What is this course about?" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What students will learn *</label>
            <textarea value={info.whatYouWillLearn} onChange={e => setInfo(p => ({ ...p, whatYouWillLearn: e.target.value }))} rows={3} placeholder="One outcome per line" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select value={info.category} onChange={e => setInfo(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
              <input type="number" min={0} value={info.price} onChange={e => setInfo(p => ({ ...p, price: e.target.value }))} placeholder="0 for free" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input value={info.tags} onChange={e => setInfo(p => ({ ...p, tags: e.target.value }))} placeholder="javascript, web, frontend" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Requirements (one per line)</label>
            <textarea value={info.instructions} onChange={e => setInfo(p => ({ ...p, instructions: e.target.value }))} rows={2} placeholder="Basic JavaScript knowledge" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-violet-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{thumbnail ? thumbnail.name : 'Click to upload image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnail(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="flex justify-end">
            <button onClick={submitStep1} disabled={isPending} className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Curriculum */}
      {step === 2 && (
        <div className="space-y-4">
          {sections.map((sec, si) => (
            <div key={si} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">Section {si + 1}</span>
                <input
                  value={sec.title}
                  onChange={e => updateSection(si, e.target.value)}
                  placeholder="Section title"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button onClick={() => removeSection(si)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3 ml-4">
                {sec.subSections.map((sub, ssi) => (
                  <div key={ssi} className="border border-gray-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 shrink-0">Lesson {ssi + 1}</span>
                      <input
                        value={sub.title}
                        onChange={e => updateSubSection(si, ssi, 'title', e.target.value)}
                        placeholder="Lesson title"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button onClick={() => removeSubSection(si, ssi)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                    <textarea
                      value={sub.description}
                      onChange={e => updateSubSection(si, ssi, 'description', e.target.value)}
                      placeholder="Lesson description"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-violet-600">
                      <Upload className="w-4 h-4" />
                      {sub.videoFile ? sub.videoFile.name : 'Upload video'}
                      <input type="file" accept="video/*" className="hidden" onChange={e => updateSubSection(si, ssi, 'videoFile', e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                ))}
                <button onClick={() => addSubSection(si)} className="text-sm text-violet-600 hover:text-violet-800 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Lesson
                </button>
              </div>
            </div>
          ))}
          <button onClick={addSection} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Section
          </button>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-600 border border-gray-200 px-5 py-2.5 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={submitStep2} disabled={isPending} className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save & Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Publish */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🎓</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to launch?</h2>
            <p className="text-gray-500 text-sm">You can publish your course now or save it as a draft to review later.</p>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => publish('Draft')} disabled={isPending} className="border border-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-60">
              Save as Draft
            </button>
            <button onClick={() => publish('Published')} disabled={isPending} className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-violet-700 disabled:opacity-60">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Course
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
