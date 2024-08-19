import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/ThemeProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AuditorIA",
  description: "Página principal de AuditorIA",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es'>
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0'
      ></meta>
      <head>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className={inter.className + " w-dvw h-dvh"}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
