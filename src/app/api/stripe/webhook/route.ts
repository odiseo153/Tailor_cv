import { NextRequest, NextResponse } from 'next/server';
import { buffer } from 'micro';
import stripe from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';
import { IncomingMessage } from 'http';

// Inicializar Prisma
const prisma = new PrismaClient();

// Deshabilitar el body parser para manejar webhooks de Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

// Mapa de manejadores de eventos para modularidad
const eventHandlers: Record<
  string,
  (event: any, prisma: PrismaClient) => Promise<void>
> = {
  'checkout.session.completed': async (event, prisma) => {
    const checkoutSession = event.data.object;
    if (checkoutSession.mode !== 'subscription') return;

    const userId = checkoutSession.metadata?.userId;
    const planId = checkoutSession.metadata?.planId;
    const subscriptionId = checkoutSession.subscription;

    if (!userId || !planId || !subscriptionId) {
      throw new Error('Missing metadata: userId, planId, or subscriptionId');
    }

    // Obtener detalles de la suscripción
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Crear o actualizar suscripción en la base de datos
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.start_date * 1000),
        currentPeriodEnd: new Date(subscription?.ended_at ?? 0 * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planId,
        currentPeriodStart: new Date(subscription.start_date * 1000),
        currentPeriodEnd: new Date(subscription?.ended_at ?? 0 * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  },

  'customer.subscription.updated': async (event, prisma) => {
    const subscription = event.data.object;
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  },

  'customer.subscription.deleted': async (event, prisma) => {
    const subscription = event.data.object;
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: subscription.status },
    });
  },

  'invoice.payment_succeeded': async (event, prisma) => {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.start_date * 1000),
        currentPeriodEnd: new Date(subscription?.ended_at ?? 0 * 1000),
      },
    });
  },

  'invoice.payment_failed': async (event, prisma) => {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: subscription.status },
    });

    // Opcional: Notificar al usuario (email, notificación en la app, etc.)
    const user = await prisma.user.findFirst({
      where: { subscription: { stripeSubscriptionId: subscription.id } },
    });
    if (user) {
      console.log(`Notificar a ${user.email}: Pago fallido para suscripción ${subscription.id}`);
      // Aquí podrías integrar un servicio de notificaciones
    }
  },
};

export async function POST(req: NextRequest) {
  // Obtener el cuerpo de la solicitud como buffer
  const buf = await buffer(req.body as unknown as IncomingMessage);
  const signature = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET no está configurado');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Error al verificar webhook: ${error.message}`, {
      eventId: event?.id,
      signature,
    });
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  /*
// Verificar idempotencia: Comprobar si el evento ya fue procesado
const existingEvent = await prisma.webhookEvent.findUnique({
where: { stripeEventId: event.id },
});
 
if (existingEvent) {
console.log(`Evento ${event.id} ya procesado`);
return NextResponse.json({ received: true });
}
 
// Registrar el evento para idempotencia
await prisma.webhookEvent.create({
data: {
stripeEventId: event.id,
eventType: event.type,
processedAt: new Date(),
},
});
*/

  // Procesar el evento
  try {
    const handler = eventHandlers[event.type];
    if (handler) {
      await handler(event, prisma);
    } else {
      console.log(`Evento no manejado: ${event.type}`, { eventId: event.id });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error al procesar evento ${event.type}: ${error.message}`, {
      eventId: event.id,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Error al procesar el webhook: ${error.message}` },
      { status: 500 }
    );
  } finally {
    // Desconectar Prisma para evitar memory leaks
    await prisma.$disconnect();
  }
}