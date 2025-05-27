import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import stripe from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Obtener información de suscripción del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuario con su stripeCustomerId y suscripciones
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }, // Usar "subscriptions" (plural) según tu esquema
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Usuario no vinculado a Stripe' },
        { status: 400 }
      );
    }

  

    // Obtener suscripciones de Stripe para el usuario
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all', // Incluir activas, canceladas, etc.
    });

    // Mapear suscripciones para incluir detalles del plan
    const subscriptions = await Promise.all(
      stripeSubscriptions.data.map(async (sub) => {
        const subscriptionItem = await stripe.subscriptionItems.list({
          subscription: sub.id,
          expand: ['data.price.product'], // Expandir detalles del precio y producto
        });

        const item = subscriptionItem.data[0];
        const price = item?.price;

        return {
          id: sub.id,
          status: sub.status,
          planId: price?.id,
          items : subscriptionItem.data,
          interval: price?.recurring?.interval,
          currentPeriodStart: new Date(sub.start_date * 1000),
          currentPeriodEnd: new Date(sub.ended_at ?? 0 * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
      })
    );

    return NextResponse.json({
      subscriptions,
    });
    
  } catch (error: any) {
    console.error('Error al obtener la suscripción:', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Error al obtener información de suscripción' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Cancelar suscripción
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user || !user.subscription || user.subscription === null) {
      return NextResponse.json(
        { error: 'No hay suscripción activa' },
        { status: 404 }
      );
    }

    const subscription = user?.subscription;
    if (!subscription) {
      return NextResponse.json(
        { error: 'No hay suscripción activa para cancelar' },
        { status: 404 }
      );
    }

    // Verificar estado en Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    if (stripeSubscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'La suscripción ya está cancelada' },
        { status: 400 }
      );
    }

    // Cancelar la suscripción en Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Actualizar en la base de datos
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    console.log('Suscripción cancelada', {
      userId: user.id,
      subscriptionId: subscription.stripeSubscriptionId,
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada correctamente',
    });
  } catch (error: any) {
    console.error('Error al cancelar la suscripción:', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Error al cancelar la suscripción' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Reactivar una suscripción cancelada
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user || !user.subscription || user.subscription === null) {
      return NextResponse.json(
        { error: 'No hay suscripción para reactivar' },
        { status: 404 }
      );
    }

    const subscription = user.subscription;
    if (!subscription) {
      return NextResponse.json(
        { error: 'No hay suscripción cancelada para reactivar' },
        { status: 404 }
      );
    }

    // Verificar estado en Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    if (!stripeSubscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'La suscripción ya está activa' },
        { status: 400 }
      );
    }

    // Reactivar la suscripción en Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Actualizar en la base de datos
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    });

    console.log('Suscripción reactivada', {
      userId: user.id,
      subscriptionId: subscription.stripeSubscriptionId,
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción reactivada correctamente',
    });
  } catch (error: any) {
    console.error('Error al reactivar la suscripción:', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Error al reactivar la suscripción' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}