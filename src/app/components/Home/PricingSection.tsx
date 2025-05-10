'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

// Tipo para los planes de suscripción
type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  stripePriceId: string;
  features: string[];
};

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Cargar planes y verificar suscripción actual
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener planes de suscripción
        const { data } = await axios.get('/api/stripe/plans');
        setPlans(data.plans);

        // Si el usuario está autenticado, verificar su suscripción
        if (status === 'authenticated') {
          try {
            const { data: subData } = await axios.get('/api/stripe/subscriptions');
            setSubscription(subData.subscription);
          } catch (error) {
            console.error('Error al obtener la suscripción:', error);
          }
        }
      } catch (error) {
        console.error('Error al cargar planes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  // Función para iniciar el proceso de checkout
  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (status !== 'authenticated') {
      // Redirigir a inicio de sesión si no está autenticado
      router.push('/api/auth/signin');
      return;
    }

    setCheckoutLoading(true);

    try {
      const { data } = await axios.post('/api/stripe/create-checkout-session', {
        priceId: plan.stripePriceId,
        planId: plan.id,
      });

      // Redirigir a la página de checkout de Stripe
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error al iniciar el checkout:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Formatear precio con moneda
  const formatPrice = (price: number, currency: string, interval: string) => {
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
    });
    
    return `${formatter.format(price)}/${interval === 'month' ? 'mes' : 'año'}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando planes...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Elige tu plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades para potenciar tu búsqueda de empleo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          // Verificar si el usuario ya está suscrito a este plan
          const isCurrentPlan = subscription && subscription.planId === plan.id;
          
          return (
            <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {formatPrice(plan.price, plan.currency, plan.interval)}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={isCurrentPlan || checkoutLoading}
                  onClick={() => handleSubscribe(plan)}
                >
                  {isCurrentPlan ? 'Plan actual' : 'Seleccionar plan'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 