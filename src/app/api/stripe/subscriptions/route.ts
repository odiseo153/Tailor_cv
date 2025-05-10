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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Obtener detalles adicionales de Stripe si es necesario
    const stripeSubscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    );

    // Obtener información del plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: user.subscription.planId }
    });

    return NextResponse.json({
      subscription: {
        ...user.subscription,
        stripeStatus: stripeSubscription.status,
        plan
      }
    });
  } catch (error) {
    console.error('Error al obtener la suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener información de suscripción' },
      { status: 500 }
    );
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
      include: { subscription: true }
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: 'No hay suscripción activa' },
        { status: 404 }
      );
    }

    // Cancelar la suscripción en Stripe (al final del período actual)
    await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Actualizar el estado en nuestra base de datos
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: { cancelAtPeriodEnd: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción cancelada correctamente' 
    });
  } catch (error) {
    console.error('Error al cancelar la suscripción:', error);
    return NextResponse.json(
      { error: 'Error al cancelar la suscripción' },
      { status: 500 }
    );
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
      include: { subscription: true }
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: 'No hay suscripción para reactivar' },
        { status: 404 }
      );
    }

    // Reactivar la suscripción en Stripe
    await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Actualizar el estado en nuestra base de datos
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: { cancelAtPeriodEnd: false }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción reactivada correctamente' 
    });
  } catch (error) {
    console.error('Error al reactivar la suscripción:', error);
    return NextResponse.json(
      { error: 'Error al reactivar la suscripción' },
      { status: 500 }
    );
  }
} 