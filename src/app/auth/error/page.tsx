'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Errores comunes de autenticación
const errorMessages: Record<string, string> = {
  Configuration: 'Error en la configuración del servidor.',
  AccessDenied: 'Acceso denegado. No tienes permiso para acceder a este recurso.',
  Verification: 'El enlace de verificación ha expirado o ya ha sido utilizado.',
  Default: 'Error durante la autenticación. Por favor, intenta nuevamente.',
  CredentialsSignin: 'Las credenciales proporcionadas no son válidas.',
  OAuthSignin: 'Error al iniciar sesión con proveedor externo.',
  OAuthCallback: 'Error al procesar la respuesta del proveedor de autenticación.',
  OAuthCreateAccount: 'No se pudo crear una cuenta utilizando el proveedor externo.',
  EmailCreateAccount: 'No se pudo crear una cuenta con el correo proporcionado.',
  Callback: 'Error durante el proceso de autenticación.',
  OAuthAccountNotLinked: 'Este correo ya está asociado a otra cuenta. Inicia sesión con el método utilizado anteriormente.',
  SessionRequired: 'Por favor, inicia sesión para acceder a esta página.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorType, setErrorType] = useState<string | null>(null);

  useEffect(() => {
    // Obtener el código de error de los parámetros de búsqueda
    const error = searchParams?.get('error');
    setErrorType(error);
  }, [searchParams]);

  const errorMessage = errorType ? (errorMessages[errorType] || errorMessages.Default) : errorMessages.Default;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Error de autenticación</CardTitle>
          <CardDescription className="text-center">
            Se ha producido un error durante el proceso de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="border-red-400 bg-red-50 text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="ml-2">{errorMessage}</AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600">
            <p>Si este problema persiste, por favor contacta a soporte técnico.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space.y-2">
          <div className="flex space-x-2 w-full">
            <Button asChild className="w-full">
              <Link href="/auth/login">Volver a iniciar sesión</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <Link href="/" className="text-primary hover:underline">
              Volver al inicio
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 