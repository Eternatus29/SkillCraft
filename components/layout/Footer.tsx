import Link from 'next/link'
import { BookOpen, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <BookOpen className="w-5 h-5 text-violet-400" />
              SkillCraft
            </Link>
            <p className="text-sm leading-relaxed">
              Empowering learners worldwide with high-quality, affordable online education.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Teach</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup?role=Instructor" className="hover:text-white transition-colors">Become an Instructor</Link></li>
              <li><Link href="/dashboard/add-course" className="hover:text-white transition-colors">Create a Course</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-center">
          © {new Date().getFullYear()} SkillCraft. All rights reserved. Built with Next.js & Tailwind CSS.
        </div>
      </div>
    </footer>
  )
}
