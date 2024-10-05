"use client"
import React from "react"
import BasicDashboard from "./basic/basic-dashboard"

export default function Dashboard() {
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
