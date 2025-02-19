"use client";

import Link from "next/link";
import { useState } from "react";
import { nameApp } from "@/app/utils/NameApp";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthForm from "../Auth/AuthComponent";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/app/layout/AppContext";

const UnAuthItems = [
    { name: "Probar", href: "/generar-cv" },
];

const AuthItems = [
    { name: "Profile", href: "/profile" },
    { name: "Probar", href: "/generar-cv" },
    { name: "Cerrar Sesión", href: "/logout" },
];

export default function Header() {
    const { user } = useAppContext();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const items = user ? AuthItems : UnAuthItems;

    const openAuthModal = () => {
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md py-4 px-6">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-2">
                    <img src="favicon.ico" className="h-6 sm:h-9" alt="Logo" />
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">{nameApp}</span>
                </Link>
                

                {/* User Profile or Authentication Buttons */}
                <div className="flex items-center space-x-4">
                    {!user ? (
                        <>
                        <Link href="/generar-cv" className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:underline">
                            Probar
                        </Link>
                            <Button variant="ghost" onClick={openAuthModal} className="text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
                                Log in
                            </Button>
                            <Button onClick={openAuthModal} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Get started
                            </Button>
                        </>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="flex items-center space-x-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={user.profilePicture || "default-avatar.jpg"} alt="User" />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-900 dark:text-white font-semibold">{user.name}</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg rounded-lg dark:bg-gray-800">
                                {AuthItems.map((item, i) => (
                                    <DropdownMenuItem key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Link href={item.href} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            {item.name}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Authentication Modal */}
            <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
                <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
                <DialogContent className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md z-50 max-w-sm w-full">
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Authentication</DialogTitle>
                    <AuthForm />
                </DialogContent>
            </Dialog>
        </header>
    );
}
