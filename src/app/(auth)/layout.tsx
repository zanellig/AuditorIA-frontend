import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAuthenticated())) {
    redirect("/login")
  }
  return <>{children}</>
}
