"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { AudioProvider } from "./AudioProvider"
import { ScrollProvider } from "./ScrollProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TranscriptionProvider } from "./TranscriptionProvider"
import { ThemeProvider } from "./ThemeProvider"
import { UserContextProvider } from "./UserProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            gcTime: 1000 * 60 * 5, // 5 minutes
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        <UserContextProvider>
          <AudioProvider>
            <ScrollProvider>
              <TooltipProvider>
                <TranscriptionProvider>{children}</TranscriptionProvider>
              </TooltipProvider>
            </ScrollProvider>
          </AudioProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </UserContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
