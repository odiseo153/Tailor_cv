import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Esta función debe configurarse como pública (no requiere autenticación)
// en la configuración de Next.js
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.error(`Error al verificar webhook: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Manejar los diferentes tipos de eventos
  try {
    switch (event.type) {
      // Cuando una suscripción es creada
      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
        // Verificar que sea de tipo suscripción
        if (checkoutSession.mode === 'subscription') {
          const userId = checkoutSession.metadata.userId;
          const planId = checkoutSession.metadata.planId;
          const subscriptionId = checkoutSession.subscription;

          // Obtener los detalles de la suscripción
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId as string
          );

          // Crear o actualizar la suscripción en nuestra base de datos
          await prisma.subscription.upsert({
            where: {
              stripeSubscriptionId: subscription.id,
            },
            update: {
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            create: {
              userId: userId,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              planId: planId,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }
        break;

      // Cuando se actualiza una suscripción
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: updatedSubscription.id,
          },
          data: {
            status: updatedSubscription.status,
            currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
          },
        });
        break;

      // Cuando se cancela una suscripción
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: deletedSubscription.id,
          },
          data: {
            status: deletedSubscription.status,
          },
        });
        break;

      // Cuando falla un pago
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        const failedSubscription = await stripe.subscriptions.retrieve(
          failedInvoice.subscription as string
        );
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: failedSubscription.id,
          },
          data: {
            status: failedSubscription.status,
          },
        });
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error al procesar webhook:', error);
    return NextResponse.json(
      { error: 'Error al procesar el webhook' },
      { status: 500 }
    );
  }
} 