"use client"
import { Suspense } from "react"
import AdvancedDashboard from "./advanced/advanced-dashboard"
import BasicDashboard from "./basic/basic-dashboard"
import { useDashboard } from "@/components/context/DashboardProvider"

export default function Dashboard() {
  const { isAdvanced } = useDashboard()

  return (
    <>
      {isAdvanced ? (
        <Suspense fallback={<div>Loading...</div>}>
          <AdvancedDashboard />
        </Suspense>
      ) : (
        <BasicDashboard />
      )}
    </>
  )
}
