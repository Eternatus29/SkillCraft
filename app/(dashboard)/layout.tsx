import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect('/login?redirect=/dashboard')

  return (
    <>
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar role={user.role} />
        <main className="flex-1 p-6 min-h-[calc(100vh-4rem)] overflow-auto">
          {children}
        </main>
      </div>
    </>
  )
}
