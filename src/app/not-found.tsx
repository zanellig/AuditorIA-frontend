"use client"

import ErrorScreen from "@/components/error-handlers/error-screen"

export default function NotFound() {
  const error = new Error("Página no encontrada...")
  return (
    <>
      <ErrorScreen
        error={error}
        reset={() => (window.location.href = "/dashboard")}
      />
    </>
  )
}
