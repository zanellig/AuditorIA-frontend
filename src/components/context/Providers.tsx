"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AudioProvider } from "./AudioProvider"
import { ScrollProvider } from "./ScrollProvider"
import { TranscriptionProvider } from "./TranscriptionProvider"
import { ThemeProvider } from "./ThemeProvider"
import { UserContextProvider } from "./UserProvider"
import { RecordingProvider } from "./RecordingProvider"

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
        defaultTheme='dark'
        disableTransitionOnChange
      >
        <UserContextProvider>
          <AudioProvider>
            <ScrollProvider>
              <TooltipProvider>
                <TranscriptionProvider>
                  <RecordingProvider>
                    {children}
                    <ReactQueryDevtools
                      initialIsOpen={false}
                      position={"left"}
                      buttonPosition={"bottom-left"}
                    />
                  </RecordingProvider>
                </TranscriptionProvider>
              </TooltipProvider>
            </ScrollProvider>
          </AudioProvider>
        </UserContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
