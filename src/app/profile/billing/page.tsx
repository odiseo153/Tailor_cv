'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionManagement from '@/components/stripe/subscription-management';
import PaymentMethods from '@/components/stripe/payment-methods';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('subscription');

  useEffect(() => {
    // Redirigir a inicio de sesión si no está autenticado
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Facturación y Suscripción</h1>
        <p className="text-gray-600">
          Gestiona tu plan de suscripción y métodos de pago
        </p>
      </div>

      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/profile">
            ← Volver al perfil
          </Link>
        </Button>
      </div>

      <Tabs 
        defaultValue="subscription" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8">
          <TabsTrigger value="subscription">Plan de suscripción</TabsTrigger>
          <TabsTrigger value="payment-methods">Métodos de pago</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="mt-0">
          <SubscriptionManagement userId={session.user.id as string} />
          
        
        </TabsContent>
        
        <TabsContent value="payment-methods" className="mt-0">
          <PaymentMethods />
        </TabsContent>
      </Tabs>
    </div>
  );
} 