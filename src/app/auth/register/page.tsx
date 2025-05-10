'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RegisterComponent from '@/app/components/Auth/RegisterComponent';
import { Session } from '@/app/api/auth/[...nextauth]/route';
import { Loading } from '@/app/components/Loading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';


export default function RegisterPage() {
  const { status } = useSession() as {
    status: string;
  }
  const router = useRouter()

  useEffect(() => {
    if (status == "authenticated") {
      router.push('/')
    }
  }, [status])

  if (status == "loading") {
    return <Loading/>
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">
            Registra tus datos para comenzar a generar tu CV profesional
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <RegisterComponent />
        </CardContent>
      </Card>
    </div>
  );
} 