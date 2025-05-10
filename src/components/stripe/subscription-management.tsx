'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';

type SubscriptionManagementProps = {
  userId: string;
};

export default function SubscriptionManagement({ userId }: SubscriptionManagementProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/stripe/subscriptions');
        setSubscription(data.subscription);
        setError('');
      } catch (error) {
        console.error('Error al obtener la suscripción:', error);
        setError('No se pudo cargar la información de tu suscripción.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Cancelar suscripción
  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción? Se mantendrá activa hasta el final del período actual.')) {
      return;
    }

    try {
      setCancelLoading(true);
      await axios.delete('/api/stripe/subscriptions');
      
      // Actualizar estado de suscripción
      setSubscription((prev: any) => ({
        ...prev,
        cancelAtPeriodEnd: true
      }));
      
      setError('');
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error);
      setError('No se pudo cancelar la suscripción. Por favor, intenta de nuevo más tarde.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Reactivar suscripción
  const handleReactivateSubscription = async () => {
    try {
      setReactivateLoading(true);
      await axios.patch('/api/stripe/subscriptions');
      
      // Actualizar estado de suscripción
      setSubscription((prev: any) => ({
        ...prev,
        cancelAtPeriodEnd: false
      }));
      
      setError('');
    } catch (error) {
      console.error('Error al reactivar la suscripción:', error);
      setError('No se pudo reactivar la suscripción. Por favor, intenta de nuevo más tarde.');
    } finally {
      setReactivateLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando información de suscripción...</div>;
  }

  // Si no hay suscripción, mostrar opción para suscribirse
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin suscripción activa</CardTitle>
          <CardDescription>No tienes ninguna suscripción activa actualmente.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();
  const isActive = subscription.status === 'active';
  const isCancelled = subscription.cancelAtPeriodEnd;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu suscripción</CardTitle>
        <CardDescription>Gestiona tu suscripción actual</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4 text-red-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Plan</h3>
            <p>{subscription.plan?.name || 'Plan estándar'}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Estado</h3>
            <div className="flex items-center">
              {isActive ? (
                <span className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Activa
                </span>
              ) : (
                <span className="text-amber-600">
                  {subscription.status}
                </span>
              )}
              
              {isCancelled && (
                <span className="ml-2 text-gray-600 text-sm">
                  (Se cancelará el {endDate})
                </span>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Período actual</h3>
            <p>Hasta el {endDate}</p>
          </div>
          
          {subscription.plan?.features && (
            <div>
              <h3 className="font-semibold mb-2">Características incluidas</h3>
              <ul className="space-y-1">
                {subscription.plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {isActive && !isCancelled ? (
          <Button 
            variant="destructive" 
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Cancelando...' : 'Cancelar suscripción'}
          </Button>
        ) : isCancelled ? (
          <Button 
            onClick={handleReactivateSubscription}
            disabled={reactivateLoading}
          >
            {reactivateLoading ? 'Reactivando...' : 'Reactivar suscripción'}
          </Button>
        ) : null}
        
        <Button asChild variant="outline">
          <Link href="/pricing">Cambiar de plan</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 