import type { Metadata } from 'next'
import { BookOpen, Users, Star, Globe } from 'lucide-react'

export const metadata: Metadata = { title: 'About Us' }

const team = [
  { name: 'Priya Sharma', role: 'CEO & Co-founder', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=7c3aed&color=fff' },
  { name: 'Rahul Mehta', role: 'CTO & Co-founder', avatar: 'https://ui-avatars.com/api/?name=Rahul+Mehta&background=4f46e5&color=fff' },
  { name: 'Ananya Roy', role: 'Head of Content', avatar: 'https://ui-avatars.com/api/?name=Ananya+Roy&background=0891b2&color=fff' },
  { name: 'Vikram Das', role: 'Lead Engineer', avatar: 'https://ui-avatars.com/api/?name=Vikram+Das&background=059669&color=fff' },
]

const stats = [
  { icon: BookOpen, label: 'Courses', value: '500+' },
  { icon: Users, label: 'Students', value: '25K+' },
  { icon: Star, label: 'Avg. Rating', value: '4.8' },
  { icon: Globe, label: 'Countries', value: '60+' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-violet-900 to-indigo-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold mb-4">About SkillCraft</h1>
          <p className="text-violet-200 text-lg leading-relaxed max-w-2xl mx-auto">
            We believe that education is a fundamental right. Our mission is to make world-class learning accessible, affordable, and enjoyable for everyone.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </section>

      {/* Mission */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-center max-w-2xl mx-auto">
            SkillCraft was founded with a simple idea: learning should be engaging, practical, and career-focused. We partner with industry experts to bring you courses that are directly applicable to real-world challenges — not just theory.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Meet the Team</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {team.map((m) => (
            <div key={m.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-full mx-auto mb-3" />
              <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
