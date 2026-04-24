import Link from 'next/link'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import {
  BookOpen,
  GraduationCap,
  Info,
  Mail,
  PenTool,
  PlusCircle,
  ShieldCheck,
  FileText,
  Cookie,
} from 'lucide-react'

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
              <a href="#" aria-label="GitHub" className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <FaGithub className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a href="#" aria-label="YouTube" className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Teach</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/signup?role=Instructor" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <PenTool className="w-3.5 h-3.5 text-gray-500" />
                  Become an Instructor
                </Link>
              </li>
              <li>
                <Link href="/dashboard/add-course" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <PlusCircle className="w-3.5 h-3.5 text-gray-500" />
                  Create a Course
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Cookie className="w-3.5 h-3.5 text-gray-500" />
                  Cookie Policy
                </Link>
              </li>
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
