import { getSession } from '@/lib/session'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
