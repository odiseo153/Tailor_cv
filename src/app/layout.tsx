"use client"

import { Analytics } from "@vercel/analytics/react"
import { SessionProvider } from "next-auth/react"
import { AppContextProvider } from "./context/AppContext"
import { I18nProvider } from "./context/I18nContext"
import Header from "./components/Home/Header"
import Footer from "./components/Home/Footer"
import "./globals.css"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  
  // Aseguramos que el componente esté completamente montado antes de renderizar contenido que pueda usar el router
  useEffect(() => {
    // Pequeño retraso para asegurar que todo esté montado correctamente
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Determinar si estamos en una ruta de autenticación
  const isAuthRoute = pathname?.startsWith('/auth');
  
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <title>TailorCV</title>
        <SessionProvider>
          <I18nProvider>
            <AppContextProvider>
              {/* Condicionar la renderización del Header basado en si estamos listos y en ruta de auth */}
              {(!isAuthRoute || isReady) && <Header />}
              
              <main className="flex-grow container mx-auto -top-px px-4 py-14">
                {/* En rutas de auth, esperar a que el componente esté listo */}
                {(isReady || !isAuthRoute) ? children : (
                  <div className="flex justify-center items-center h-[70vh]">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </main>
              
              {(!isAuthRoute || isReady) && <Footer />}
            </AppContextProvider>
          </I18nProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}