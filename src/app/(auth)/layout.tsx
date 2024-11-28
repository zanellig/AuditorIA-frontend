import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
export const dynamic = "force-dynamic"
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
