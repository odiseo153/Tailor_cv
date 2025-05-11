"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User, LogOut, Home, Settings, FileText, Info, Mail, ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { nameApp } from "@/app/utils/NameApp"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useStore } from "@/app/context/AppContext"
import { useSession, signOut } from "next-auth/react"
import AuthForm from "../Auth/AuthComponent"
import { Session } from "@/app/api/auth/[...nextauth]/route"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export default function Header() {
  const { authOpen, setAuthOpen } = useStore()
  const { data: session,status } = useSession() as {
    data: Session | null;
    status: string;
  };
  const pathname = usePathname()

  const user = session?.user
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Determinar si estamos en páginas de autenticación
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/register"


  // Cerrar el menú móvil al navegar
  useEffect(() => {
    setIsOpen(false)
  }, [])

  // Detectar scroll para cambiar estilos del header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Definir ítems del menú según el estado de autenticación
  const navigationItems = [
    { 
      label: "Inicio", 
      href: "/", 
      icon: <Home className="h-4 w-4 mr-2" />,
      showWhen: "always" 
    },
    { 
      label: "Cómo Funciona", 
      href: "/#how-it-works", 
      icon: <Info className="h-4 w-4 mr-2" />,
      showWhen: "guest" 
    },
    { 
      label: "¿Por qué TailorCV?", 
      href: "/#benefits", 
      icon: <FileText className="h-4 w-4 mr-2" />,
      showWhen: "guest" 
    },
    { 
      label: "Generar CV", 
      href: "/generar-cv", 
      icon: <FileText className="h-4 w-4 mr-2" />,
      showWhen: "authenticated" 
    },
    { 
      label: "Contáctanos", 
      href: "/#contact", 
      icon: <Mail className="h-4 w-4 mr-2" />,
      showWhen: "always" 
    },
  ]
  
  const userMenuItems = [
    { 
      label: "Perfil", 
      href: "/profile", 
      icon: <User className="h-4 w-4 mr-2" /> 
    },
    { 
      label: "Configuración", 
      href: "/profile/billing", 
      icon: <Settings className="h-4 w-4 mr-2" /> 
    },
    { 
      label: "Cerrar Sesión", 
      onClick: () => signOut(), 
      icon: <LogOut className="h-4 w-4 mr-2" />
    }
  ]

  // Filtrar ítems del menú según estado de autenticación
  const filteredNavItems = navigationItems.filter(item => {
    if (item.showWhen === 'always') return true;
    if (item.showWhen === 'authenticated' && user) return true;
    if (item.showWhen === 'guest' && !user) return true;
    return false;
  });

  if(status == "loading"){
    return null;
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-md py-2" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-2" 
          aria-label="TailorCV"
        >
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-semibold text-foreground">{nameApp}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNavItems.map((item, i) => (
            <Link 
              key={i} 
              href={item.href} 
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "hover:bg-primary/10 text-foreground/80 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User actions - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-primary/10 rounded-full p-2 h-auto"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.profilePicture || user?.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2 border-b">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture || user?.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-primary/10">{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium line-clamp-1">{user.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{user.email}</p>
                  </div>
                </div>
                
                <div className="p-1">
                  {userMenuItems.map((item, i) => (
                    item.href ? (
                      <Link 
                        key={i} 
                        href={item.href}
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ) : (
                      <DropdownMenuItem 
                        key={i} 
                        onClick={item.onClick}
                        className="cursor-pointer"
                      >
                        {item.icon}
                        {item.label}
                      </DropdownMenuItem>
                    )
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            isAuthPage && (
              <Button onClick={() => setAuthOpen(true)} className="bg-primary hover:bg-primary/90">
                Iniciar Sesión
              </Button>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <Button 
          variant="ghost" 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-1 h-auto"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: isOpen ? -90 : 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: isOpen ? 90 : -90 }}
              transition={{ duration: 0.15 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden"
          >
            <nav className="container mx-auto px-4 py-4 bg-background/95 backdrop-blur-md border-t mt-1">
              <div className="space-y-1 mb-4">
                {filteredNavItems.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-primary/10"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              
              {user ? (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profilePicture || user?.image || ""} alt={user.name || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {userMenuItems.map((item, i) => (
                      item.href ? (
                        <Link
                          key={i}
                          href={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-primary/10"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          key={i}
                          onClick={() => {
                            item.onClick?.();
                            setIsOpen(false);
                          }}
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-primary/10 w-full text-left"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      )
                    ))}
                  </div>
                </div>
              ) : (
                isAuthPage && (
                  <Button onClick={() => {
                    setAuthOpen(true);
                    setIsOpen(false);
                  }} className="w-full bg-primary hover:bg-primary/90">
                    Iniciar Sesión
                  </Button>
                )
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-semibold text-center">Acceso a tu cuenta</DialogTitle>
          <AuthForm />
        </DialogContent>
      </Dialog>
    </motion.header>
  )
}