"use client"
import { AudioProvider } from "@/components/context/AudioProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
const queryClient = new QueryClient()
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>{children}</AudioProvider>
    </QueryClientProvider>
  )
}
