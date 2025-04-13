"use client"

import { Analytics } from "@vercel/analytics/react"
import { SessionProvider } from "next-auth/react"
import { AppContextProvider } from "./context/AppContext"
import Header from "./components/Home/Header"
import Footer from "./components/Home/Footer"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col ">
        <title>TailorCV</title>
        <SessionProvider>
          <AppContextProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-7">
              {children}
            </main>
            <Footer />
          </AppContextProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}