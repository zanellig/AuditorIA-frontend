
import { Metadata } from "next"
import Dashboard from "@/components/dashboard/dashboard"

export const metadata: Metadata = {
  title: "Dashboard | AuditorIA",
  description: "Dashboard donde encontrarás todas las tareas y grabaciones",
}

export default function Page() {
  return <Dashboard />
}
