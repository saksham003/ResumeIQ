import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user || undefined

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />

        <main
          id="dashboard-main-content"
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
