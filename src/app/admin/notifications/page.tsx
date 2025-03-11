import { AdminGlobalNotifications } from "@/components/notifications/admin-global-notifications"

export const metadata = {
  title: "Admin - Notifications Management",
  description: "Manage global notifications in the system",
}

export default function AdminNotificationsPage() {
  return (
    <div className='container py-10'>
      <h1 className='text-3xl font-bold mb-8 text-center'>
        Notifications Management
      </h1>

      <div className='grid gap-8'>
        <section>
          <h2 className='text-xl font-semibold mb-4'>Global Notifications</h2>
          <AdminGlobalNotifications />
        </section>
      </div>
    </div>
  )
}
