"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { nameApp } from "@/app/utils/NameApp"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useStore } from "@/app/context/AppContext"
import { useSession, signOut } from "next-auth/react"
import AuthForm from "../Auth/AuthComponent"

export default function Navbar() {
  const { authOpen, setAuthOpen } = useStore()
  const { data: session } = useSession()
  const user = session?.user
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const menuItems = user
    ? [
        { label: "Perfil", href: "/profile" },
        { label: "Cerrar Sesión", onClick: () => signOut() },
        { label: "Contacto", href: "/contacto" },
      ]
    : [
        { label: "Cómo Funciona", href: "#how-it-works" },
        { label: "¿Por qué TailorCV?", href: "#benefits" },
        { label: "Contáctanos", href: "#contact" },
      ]

  const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          {nameApp}
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition">
                <Avatar className="w-8 h-8" />
                <span className="font-medium text-gray-800">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white rounded-xl shadow-lg p-1">
                {menuItems.map((item, i) => (
                  <DropdownMenuItem key={i} className="rounded-md hover:bg-gray-100">
                    {item.href ? (
                      <Link href={item.href} className="block w-full py-2 px-3 text-sm text-gray-700">
                        {item.label}
                      </Link>
                    ) : (
                      <button onClick={item.onClick} className="block w-full py-2 px-3 text-sm text-gray-700 text-left">
                        {item.label}
                      </button>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {menuItems.map((item, i) => (
                <Link key={i} href={item.href || ""} className="text-gray-700 hover:text-blue-600">
                  {item.label}
                </Link>
              ))}
              {/*
              <Button onClick={() => setAuthOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                Iniciar Sesión
              </Button>
              */}
            </>
          )}
        </nav>

        {/* Mobile Toggle */}
        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.nav
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="md:hidden bg-white shadow-lg rounded-b-xl p-4 space-y-3"
        >
          {menuItems.map((item, i) => (
            <div key={i}>
              {item.href ? (
                <Link href={item.href} className="block py-2 text-gray-700 hover:text-blue-600">
                  {item.label}
                </Link>
              ) : (
                <button onClick={item.onClick} className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                  {item.label}
                </button>
              )}
            </div>
          ))}
          {!user && (
            <Button onClick={() => setAuthOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg">
              Iniciar Sesión
            </Button>
          )}
        </motion.nav>
      )}

      {/* Auth Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 className="text-lg font-semibold mb-4">Inicia Sesión</h2>
          <AuthForm />
        </DialogContent>
      </Dialog>
    </motion.header>
  )
}