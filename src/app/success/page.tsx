'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    // Esperar a que se cargue la sesión
    if (status === 'loading') {
      return;
    }

    // Obtener detalles de la suscripción
    const fetchSubscription = async () => {
      try {
        const { data } = await axios.get('/api/stripe/subscriptions');
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Error al obtener la suscripción:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [router, status]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Verificando suscripción...</div>;
  }

  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">¡Suscripción completada!</h1>
        
        <p className="text-lg mb-8">
          Tu suscripción ha sido procesada correctamente. Ahora puedes disfrutar de todas las
          ventajas de tu nuevo plan.
        </p>

        {subscription && (
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-2">Detalles de tu suscripción</h2>
            <p className="mb-1"><strong>Plan:</strong> {subscription.plan?.name}</p>
            <p className="mb-1"><strong>Estado:</strong> {subscription.status === 'active' ? 'Activa' : subscription.status}</p>
            <p><strong>Próxima renovación:</strong> {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link href="/profile">
              Ver mi perfil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Ir a la página principal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 