import { Metadata } from "next"
import BasicDashboard from "@/components/dashboard/basic-dashboard"

export const metadata: Metadata = {
  title: "Dashboard | AuditorIA",
  description: "Dashboard donde encontrarás todas las tareas y grabaciones",
}

export default function Page() {
  return <BasicDashboard />
}
