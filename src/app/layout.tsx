"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Home/Header";
import { AppContextProvider } from "./context/AppContext";
import Footer from "./components/Home/Footer";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react"


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        <title>TailorCV</title>
        <SessionProvider>

        <AppContextProvider >
          <Header />
          <div className="mt-7">
          {children}
          </div>
          <Footer />
        </AppContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
