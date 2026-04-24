import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'SkillCraft', template: '%s | SkillCraft' },
  description: 'Learn in-demand skills from expert instructors at SkillCraft.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-gray-50 antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
