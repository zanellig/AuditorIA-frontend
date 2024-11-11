import React from "react"
import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/context/Providers"
import { Toaster } from "@/components/ui/toaster"

const openSans = Open_Sans({ subsets: ["latin"] })

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
        <link rel='icon' href='/favicon.ico' sizes='any' />
      </head>
      <body className={openSans.className + " w-dvw h-dvh"}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
