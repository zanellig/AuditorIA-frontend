"use client"

import AdvancedDashboard from "./advanced/advanced-dashboard"
import BasicDashboard from "./basic/basic-dashboard"
import { useDashboard } from "@/components/DashboardProvider"

export default function Dashboard() {
  const { isAdvanced } = useDashboard()
  return <>{isAdvanced ? <AdvancedDashboard /> : <BasicDashboard />}</>
}
