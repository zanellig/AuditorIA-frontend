import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='border-b'>
        <div className='container flex items-center justify-between h-16'>
          <div className='flex items-center gap-6'>
            <Link
              href='/dashboard'
              className='flex items-center text-sm font-medium text-muted-foreground hover:text-foreground'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Dashboard
            </Link>
            <h1 className='text-lg font-semibold'>Admin Panel</h1>
          </div>
          <nav className='flex items-center gap-6'>
            <Link
              href='/admin/notifications'
              className='text-sm font-medium hover:text-primary'
            >
              Notifications
            </Link>
            {/* Add more admin navigation links here */}
          </nav>
        </div>
      </header>
      <main className='flex-1'>{children}</main>
    </div>
  )
}
