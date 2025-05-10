'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/app/components/Loading';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Esta API tendría que crearse para enviar correos de recuperación
      // Por ahora, simularemos una respuesta exitosa
      /*
      const response = await axios.post('/api/auth/forgot-password', { email });
      if (response.data.success) {
        setSuccessMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.');
        setIsSubmitted(true);
      } else {
        setErrorMessage(response.data.error || 'Error al procesar la solicitud. Intenta nuevamente.');
      }
      */

      // Simulación de solicitud exitosa
      setSuccessMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.');
      setIsSubmitted(true);
      
    } catch (error: any) {
      console.error('Error en recuperación de contraseña:', error);
      setErrorMessage(error.response?.data?.error || 'Error al enviar la solicitud. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Vista después de enviar la solicitud
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Solicitud Enviada</CardTitle>
            <CardDescription className="text-center">
              Revisa tu bandeja de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="ml-2">
                {successMessage}
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-600">
              <p>
                Si no recibes el correo en los próximos minutos, revisa tu carpeta de spam o 
                intenta nuevamente con otra dirección de correo.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button asChild className="w-full ml-2">
              <Link href="/auth/login">
                Ir a iniciar sesión
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico para recibir instrucciones
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
            
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 