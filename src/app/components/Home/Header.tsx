"use client";

import Link from "next/link";
import { useState } from "react";
import { nameApp } from "@/app/utils/NameApp";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthForm from "../Auth/AuthComponent";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/app/layout/AppContext";

const UnAuthItems = [
  { name: "Probar", href: "/generar-cv" },
];

const AuthItems = [
  { name: "Perfil", href: "/profile" },
  { name: "Cerrar Sesión", href: "/logout" },
];

export default function Header() {
  const { user } = useAppContext();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const items = user ? AuthItems : UnAuthItems;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <img src="favicon.ico" alt="Logo" className="h-8 w-8 rounded-md" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{nameApp}</span>
        </Link>

        <div className="flex items-center space-x-4">
          {!user ? (
            <Link
              href="/generar-cv"
              className="bg-blue-600 text-white font-medium py-2 px-5 rounded-full text-sm hover:bg-blue-700 transition-all shadow-sm"
            >
              Probar
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.profilePicture || "/default-avatar.jpg"} alt="User" />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 bg-white shadow-2xl rounded-xl dark:bg-gray-800 p-2"
              >
                <Link
                  href="/generar-cv"
                  className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-700 transition mb-2"
                >
                  Probar
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                {AuthItems.map((item, i) => (
                  <DropdownMenuItem key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <Link
                      href={item.href}
                      className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Modal de autenticación */}
      <Dialog open={isAuthModalOpen} onOpenChange={() => setIsAuthModalOpen(!isAuthModalOpen)}>
        <DialogOverlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
        <DialogContent className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl z-50 max-w-sm w-full">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inicia sesión
          </DialogTitle>
          <AuthForm />
        </DialogContent>
      </Dialog>
    </header>
  );
}
