'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, Trash2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Carga de Stripe con la clave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_API_STRIPE_PUBLIC_KEY as string);

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

// Lista de países para el formulario
const countries = [
  { value: 'ES', label: 'España' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'DO', label: 'República Dominicana' },
];

// Componente para agregar nuevo método de pago
function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Estados para cada campo del formulario
  const [cardholderName, setCardholderName] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'ES',
  });
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Validación básica de formulario
  const validateForm = () => {
    if (!cardholderName.trim()) {
      setError('El nombre del titular es obligatorio');
      return false;
    }
    if (!address.line1.trim()) {
      setError('La dirección es obligatoria');
      return false;
    }
    if (!address.city.trim()) {
      setError('La ciudad es obligatoria');
      return false;
    }
    if (!address.postalCode.trim()) {
      setError('El código postal es obligatorio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('No se pudo conectar con el procesador de pagos');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('No se pudo acceder al elemento de tarjeta');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Crear método de pago en Stripe con información completa
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          address: {
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            postal_code: address.postalCode,
            country: address.country,
          },
        },
      });


      if (error) {
        throw new Error(error.message);
      }
      
      if (!paymentMethod) {
        throw new Error('Error al crear el método de pago');
      }

      // Guardar método de pago en el backend
      await axios.post('/api/stripe/payment-methods', {
        paymentMethodId: paymentMethod.id,
        isDefault: saveAsDefault,
        billingDetails: {
          name: cardholderName,
          address: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        },
      });

      // Mostrar mensaje de éxito y limpiar formulario
      setSuccess(true);
      cardElement.clear();
      setCardholderName('');
      setAddress({
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'ES',
      });
      setSaveAsDefault(false);
      
      // Esperar un momento para mostrar el mensaje de éxito antes de cerrar
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Error al agregar el método de pago');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">¡Tarjeta agregada con éxito!</h3>
        <p className="text-gray-500 mb-4">Tu nuevo método de pago ha sido guardado correctamente.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-md mb-4 text-red-800 text-sm">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Información de la tarjeta */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="cardholderName">Nombre del titular de la tarjeta</Label>
          <Input
            id="cardholderName"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Nombre como aparece en la tarjeta"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="card-element">Información de la tarjeta</Label>
          <div className="p-3 border rounded-md mt-1">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: true, // Usamos nuestro propio campo para el código postal
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tu tarjeta será cargada con seguridad a través de Stripe.
          </p>
        </div>
      </div>

      {/* Dirección de facturación */}
      <div className="pt-4 border-t">
        <h3 className="font-medium mb-4">Dirección de facturación</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="line1">Dirección</Label>
            <Input
              id="line1"
              value={address.line1}
              onChange={(e) => setAddress({...address, line1: e.target.value})}
              placeholder="Calle y número"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="line2">Apartamento, suite, etc. (opcional)</Label>
            <Input
              id="line2"
              value={address.line2}
              onChange={(e) => setAddress({...address, line2: e.target.value})}
              placeholder="Detalles adicionales de la dirección"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
                placeholder="Ciudad"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="state">Provincia/Estado</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) => setAddress({...address, state: e.target.value})}
                placeholder="Provincia o estado"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Código postal</Label>
              <Input
                id="postalCode"
                value={address.postalCode}
                onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                placeholder="Código postal"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="country">País</Label>
              <Select 
                value={address.country} 
                onValueChange={(value) => setAddress({...address, country: value})}
              >
                <SelectTrigger id="country" className="mt-1">
                  <SelectValue placeholder="Seleccione un país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Opción para establecer como predeterminado */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="saveAsDefault" 
          checked={saveAsDefault} 
          onCheckedChange={(checked) => setSaveAsDefault(checked as boolean)} 
        />
        <Label htmlFor="saveAsDefault" className="text-sm cursor-pointer">
          Guardar como método de pago predeterminado
        </Label>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="min-w-32"
        >
          {loading ? 'Procesando...' : 'Guardar método de pago'}
        </Button>
      </div>
    </form>
  );
}

// Componente principal de gestión de métodos de pago
export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [setDefaultLoading, setSetDefaultLoading] = useState<string | null>(null);

  // Cargar métodos de pago
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/stripe/payment-methods');
      setPaymentMethods(data.paymentMethods || []);
      setError('');
    } catch (err) {
      console.error('Error al obtener métodos de pago:', err);
      setError('No se pudieron cargar los métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Eliminar método de pago
  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await axios.delete(`/api/stripe/payment-methods?id=${id}`);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } catch (err) {
      console.error('Error al eliminar método de pago:', err);
      setError('No se pudo eliminar el método de pago');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Establecer método de pago predeterminado
  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      setSetDefaultLoading(id);
      await axios.patch(`/api/stripe/payment-methods/default`, { 
        paymentMethodId: id 
      });
      
      // Actualizar localmente la lista de métodos
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        isDefault: method.id === id
      })));
    } catch (err) {
      console.error('Error al establecer método de pago predeterminado:', err);
      setError('No se pudo actualizar el método de pago predeterminado');
    } finally {
      setSetDefaultLoading(null);
    }
  };

  // Formatear nombre de tarjeta
  const formatCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      jcb: 'JCB',
      diners: 'Diners Club',
      unionpay: 'UnionPay',
    };

    return brands[brand.toLowerCase()] || brand;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de pago</CardTitle>
        <CardDescription>Gestiona tus tarjetas y métodos de pago</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4 text-red-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-6 text-center">Cargando métodos de pago...</div>
        ) : (
          <>
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id} 
                    className={`flex items-center justify-between p-4 border rounded-md ${
                      method.isDefault ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3" />
                      <div>
                        <div className="font-medium">
                          {formatCardBrand(method.brand)} •••• {method.last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expira: {method.expMonth}/{method.expYear}
                          {method.isDefault && (
                            <span className="ml-2 text-primary font-medium">
                              (Predeterminada)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          disabled={!!setDefaultLoading}
                          className="text-xs"
                        >
                          {setDefaultLoading === method.id ? 'Actualizando...' : 'Establecer como predeterminada'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        disabled={!!deleteLoading || (method.isDefault && paymentMethods.length > 1)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-2">
                  No tienes métodos de pago guardados
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  Agrega una tarjeta para agilizar tus pagos futuros
                </p>
              </div>
            )}

            {showAddForm ? (
              <div className="mt-6 border rounded-md p-5">
                <h3 className="text-lg font-medium mb-4">Agregar nuevo método de pago</h3>
                <Elements stripe={stripePromise}>
                  <AddPaymentMethodForm
                    onSuccess={() => {
                      fetchPaymentMethods();
                      setShowAddForm(false);
                    }}
                  />
                </Elements>
              </div>
            ) : (
              <div className="mt-6">
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Agregar nuevo método de pago
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 