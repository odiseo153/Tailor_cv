import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.NEXT_PUBLIC_API_STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
});

const subscriptionPlans = [
  {
    name: 'Plan Básico',
    description: 'Perfecto para comenzar a crear tu CV profesional',
    price: 5,
    currency: 'USD',
    interval: 'month',
    features: [
      'Hasta 3 plantillas de CV',
      'Edición básica de CV',
      'Exportación a PDF',
      'Almacenamiento de 1 CV',
    ],
  },
  {
    name: 'Plan Profesional',
    description: 'Para profesionales que buscan destacar en el mercado laboral',
    price: 10,
    currency: 'USD',
    interval: 'month',
    features: [
      'Todas las plantillas de CV disponibles',
      'Edición avanzada de CV',
      'Exportación a PDF y Word',
      'Almacenamiento de 5 CVs',
      'Sugerencias de mejora de CV',
      'Soporte por correo electrónico',
    ],
  },
  {
    name: 'Plan Premium',
    description: 'La solución completa para maximizar tus oportunidades laborales',
    price: 20,
    currency: 'USD',
    interval: 'month',
    features: [
      'Todas las características del Plan Profesional',
      'Almacenamiento ilimitado de CVs',
      'Análisis ATS avanzado',
      'Plantillas exclusivas Premium',
      'Personalización completa del CV',
      'Soporte prioritario',
      'Actualizaciones de nuevas funciones primero',
    ],
  },
];

async function main() {
  console.log('Inicio de la siembra de planes de suscripción...');

  for (const plan of subscriptionPlans) {
    try {
      // Crear producto en Stripe
      console.log(`Creando producto para ${plan.name}...`);
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
      });

      // Crear precio en Stripe
      console.log(`Creando precio para ${plan.name}...`);
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100), // Convertir a centavos
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
        },
      });

      // Guardar en base de datos
      console.log(`Guardando plan ${plan.name} en la base de datos...`);
      await prisma.subscriptionPlan.create({
        data: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval,
          stripePriceId: price.id,
          features: plan.features,
          active: true,
        },
      });

      console.log(`Plan ${plan.name} creado exitosamente.`);
    } catch (error) {
      console.error(`Error al crear el plan ${plan.name}:`, error);
    }
  }

  console.log('Siembra de planes de suscripción completada.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 