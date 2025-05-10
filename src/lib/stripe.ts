import Stripe from 'stripe';

// Inicializa el cliente de Stripe con la clave secreta
const stripe = new Stripe(process.env.NEXT_PUBLIC_API_STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil', // Utiliza la versión más reciente de la API
  appInfo: {
    name: 'Tailor CV',
    version: '1.0.0',
  },
});

export default stripe; 