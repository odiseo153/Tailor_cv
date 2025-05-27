'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Calendar, Clock, CreditCard, RefreshCcw } from 'lucide-react';
import Link from 'next/link';


export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/stripe/subscriptions');
        setSubscriptions(data.subscriptions);
        setError('');
      } catch (error) {
        console.error('Error al obtener las suscripciones:', error);
        setError('No se pudo cargar la información de tus suscripciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción? Se mantendrá activa hasta el final del período actual.')) {
      return;
    }

    try {
      setCancelLoading(true);
      await axios.delete('/api/stripe/subscriptions');
      
      // Actualizar estado de suscripciones
      const updatedSubscriptions = subscriptions.map(sub => ({
        ...sub,
        cancelAtPeriodEnd: true
      }));
      setSubscriptions(updatedSubscriptions);
      
      setError('');
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error);
      setError('No se pudo cancelar la suscripción. Por favor, intenta de nuevo más tarde.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setReactivateLoading(true);
      await axios.patch('/api/stripe/subscriptions');
      
      // Actualizar estado de suscripciones
      const updatedSubscriptions = subscriptions.map(sub => ({
        ...sub,
        cancelAtPeriodEnd: false
      }));
      setSubscriptions(updatedSubscriptions);
      
      setError('');
    } catch (error) {
      console.error('Error al reactivar la suscripción:', error);
      setError('No se pudo reactivar la suscripción. Por favor, intenta de nuevo más tarde.');
    } finally {
      setReactivateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Sin suscripciones activas</CardTitle>
          <CardDescription className="text-gray-600">
            No tienes ninguna suscripción activa actualmente.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild variant="default" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Link href="/plans">Ver planes disponibles</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {subscriptions.map((subscription, index) => {
        const startDate = new Date(subscription.currentPeriodStart).toLocaleDateString();
        const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();
        const isActive = subscription.status === 'active';
        const isCancelled = subscription.cancelAtPeriodEnd;

        return (
          <Card key={index} className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className={`h-2 ${isActive ? 'bg-green-500' : 'bg-amber-500'}`} />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {subscription.items[0]?.price?.product?.name || 'Estándar'}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {subscription.interval === 'month' ? 'Facturación mensual' : 'Facturación anual'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {isActive && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Check className="h-4 w-4 mr-1" />
                      Activa
                    </span>
                  )}
                  {isCancelled && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      Cancelación programada
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-700">Fecha de inicio</h4>
                    <p className="text-gray-600">{startDate}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-700">Próxima facturación</h4>
                    <p className="text-gray-600">{endDate}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-700">ID de Suscripción</h4>
                    <p className="text-gray-600">{subscription.id}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <RefreshCcw className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-700">Estado de renovación</h4>
                    <p className="text-gray-600">
                      {isCancelled ? 'No se renovará' : 'Renovación automática'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 border-t">
              {isActive && !isCancelled ? (
                <Button 
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="w-full sm:w-auto"
                >
                  {cancelLoading ? 'Cancelando...' : 'Cancelar suscripción'}
                </Button>
              ) : isCancelled ? (
                <Button 
                  onClick={handleReactivateSubscription}
                  disabled={reactivateLoading}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  {reactivateLoading ? 'Reactivando...' : 'Reactivar suscripción'}
                </Button>
              ) : null}
              
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/plans">Cambiar de plan</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}