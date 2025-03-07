"use client"
import React from "react"
import { Open_Sans } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/context/ThemeProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PostHogProvider } from "@/components/context/Posthog"
import { Toaster } from "@/components/ui/toaster"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = React.useState(
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
    <html lang='es'>
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0'
      ></meta>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
      </head>
      <body className={openSans.className}>
        <PostHogProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute='class'
              defaultTheme='dark'
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryClientProvider>
        </PostHogProvider>
        <Toaster />
      </body>
    </html>
  )
}
