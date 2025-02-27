// Server Component
import { getHost } from "@/lib/actions"
import SettingsClient from "./_components/settings-client"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  // Fetch data on the server
  const host = await getHost()
  const apiUrls = await fetch(`${host}/api/routes`).then(res => res.json())

  // Pass the data to the client component
  return <SettingsClient initialApiUrls={apiUrls} host={host} />
}
