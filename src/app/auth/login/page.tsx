'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginComponent from '@/app/components/Auth/LoginComponent';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function LoginPage() {
  const { status } = useSession() as {
    status: string;
  }
 
  useEffect(() => {
    if (status == "authenticated") {
      window.location.href = '/';

    }
  }, [status])

  if (status == "authenticated") {
    return null;
  }
  
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="relative w-full max-w-md">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-5 w-5" />
        </Link>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        
          <LoginComponent />
      </Card>
    </div>
  );
} 