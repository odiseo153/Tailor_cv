'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { nameApp } from "@/app/utils/NameApp";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import AuthForm from "../Auth/AuthComponent";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/app/context/AppContext";
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { authOpen, setAuthOpen } = useStore();
  const { data: session } = useSession();
  const user = session?.user;

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const AuthenticatedMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <Avatar className="w-10 h-10">
          {/*
            <AvatarImage src={user?.profilePicture || "/default-avatar.jpg"} alt="User" />
           */}
          </Avatar>
          <span className="text-gray-900 dark:text-white font-medium">{user?.name}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 bg-white shadow-2xl rounded-xl dark:bg-gray-800 p-2">
        <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
          <Link href="/profile" className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
          <button
            onClick={() => signOut()}
            className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 text-left"
          >
            Cerrar Sesión
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
          <Link href="/contacto" className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Contacto
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const UnauthenticatedMenu = () => (
    <div className="space-x-5">
      <a href="#how-it-works" className="text-black hover:text-blue-700">
        Como Funciona
      </a>
      <a href="#benefits" className="text-black hover:text-blue-700">
        ¿Por qué TailorCV?
      </a>
      <a href="#contact" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Contáctanos
      </a>
      {/*
      <Button
        onClick={() => setAuthOpen(true)}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Iniciar Sesión
      </Button>
       */}
    </div>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          <Link href="/">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                {nameApp}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {user ? <AuthenticatedMenu /> : <UnauthenticatedMenu />}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-dark">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-lg p-4 space-y-4">
          {user ? (
            <>
              <Link href="/profile" className="block text-gray-700 hover:text-blue-600">
                Perfil
              </Link>
              <button
                onClick={() => signOut()}
                className="block text-gray-700 hover:text-blue-600 text-left w-full"
              >
                Cerrar Sesión
              </button>
              <Link href="/contacto" className="block text-gray-700 hover:text-blue-600">
                Contacto
              </Link>
            </>
          ) : (
            <>
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600">
                Como Funciona
              </a>
              <a href="#benefits" className="block text-gray-700 hover:text-blue-600">
                ¿Por qué TailorCV?
              </a>
              <a href="#contact" className="block text-gray-700 hover:text-blue-600">
                Contáctanos
              </a>
              {/*
              <Button
                onClick={() => setAuthOpen(true)}
                className="w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </Button>
               */}
            </>
          )}
        </div>
      )}

      {/* Auth Dialog */}
      <Dialog open={authOpen} onOpenChange={() => setAuthOpen(!authOpen)}>
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
};

export default Navbar;