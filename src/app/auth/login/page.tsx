'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginComponent from '@/app/components/Auth/LoginComponent';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <LoginComponent />
        </CardContent>
      </Card>
    </div>
  );
} 