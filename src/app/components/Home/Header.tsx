'use client'

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { nameApp } from "@/app/utils/NameApp";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthForm from "../Auth/AuthComponent";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/app/context/AppContext";

const UnAuthItems = [
  { name: "Probar", href: "/generar-cv" },
];

const AuthItems = [
  { name: "Perfil", href: "/profile" },
  { name: "Cerrar Sesión", href: "/logout" },
];

export default function Navbar(){
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const items = user ? AuthItems : UnAuthItems;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          <Link href="/">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">{nameApp}</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <div className="space-x-5">
                <a href="#how-it-works" className="text-black hover:text-blue-700">Como Funciona</a>
                <a href="#benefits" className="text-black hover:text-blue-700">¿Por que TailorCV?</a>
                <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}>Contactanos</Button>
              </div>
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
                <DropdownMenuContent align="end" className="w-60 bg-white shadow-2xl rounded-xl dark:bg-gray-800 p-2">
                  {AuthItems.map((item, i) => (
                    <DropdownMenuItem key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                      <Link href={item.href} className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-dark">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>


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
  )
};
