"use client"
import BasicDashboard from "./basic/basic-dashboard"

export default function Dashboard() {
  // const { isAdvanced } = useDashboard()

  return (
    <>
      {/* {isAdvanced ? (
        <Suspense fallback={<div>Loading...</div>}>
          <AdvancedDashboard />
        </Suspense>
      ) : ( */}
      <BasicDashboard />
      {/* )} */}
    </>
  )
}
