"use client"

import { useRouter } from "next/navigation"
import ErrorScreen from "@/components/error/error-screen"

export default function NotFound() {
  const router = useRouter()
  const error = new Error("Página no encontrada...")
  return (
    <>
      <ErrorScreen error={error} reset={() => router.push("/dashboard")} />
    </>
  )
}
