import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import stripe from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
//import { Session } from 'next-auth';

const prisma = new PrismaClient();

// Obtener los métodos de pago del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
   
    
    if (!session?.user?.email) {
      
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // Obtener métodos de pago de Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    // Obtener los métodos guardados en nuestra base de datos
    const dbPaymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ 
      paymentMethods: paymentMethods.data.map(method => {
        const dbMethod = dbPaymentMethods.find(
          dbm => dbm.stripePaymentMethodId === method.id
        );
        
        return {
          id: method.id,
          brand: method.card?.brand,
          last4: method.card?.last4,
          expMonth: method.card?.exp_month,
          expYear: method.card?.exp_year,
          isDefault: dbMethod?.isDefault || false
        };
      })
    });
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    return NextResponse.json(
      { error: 'Error al obtener métodos de pago' },
      { status: 500 }
    );
  }
}

// Agregar un nuevo método de pago
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'ID de método de pago requerido' },
        { status: 400 }
      );
    }

    // Asegurarse de que el usuario tenga un customerId en Stripe
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
      
      user.stripeCustomerId = customer.id;
    }

    // Asociar método de pago con el cliente en Stripe
    await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: user.stripeCustomerId }
    );

    // Obtener detalles del método de pago
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Determinar si es el primer método de pago (será el predeterminado)
    const existingMethods = await prisma.paymentMethod.count({
      where: { userId: user.id }
    });

    const isDefault = existingMethods === 0;

    // Si es el método predeterminado, actualizar al cliente en Stripe
    if (isDefault) {
      await stripe.customers.update(
        user.stripeCustomerId,
        { invoice_settings: { default_payment_method: paymentMethodId } }
      );
    }

    // Guardar el método de pago en nuestra base de datos
    await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
        brand: paymentMethod.card?.brand,
        isDefault
      }
    });

    return NextResponse.json({ 
      success: true, 
      paymentMethod: {
        id: paymentMethod.id,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
        isDefault
      }
    });
  } catch (error) {
    console.error('Error al agregar método de pago:', error);
    return NextResponse.json(
      { error: 'Error al agregar método de pago' },
      { status: 500 }
    );
  }
}

// Eliminar un método de pago
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'ID de método de pago requerido' },
        { status: 400 }
      );
    }

    // Verificar si el método de pago pertenece al usuario
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        userId: user.id,
        stripePaymentMethodId: paymentMethodId
      }
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Método de pago no encontrado' },
        { status: 404 }
      );
    }

    // Si es el método predeterminado y hay otros métodos, establecer otro como predeterminado
    if (paymentMethod.isDefault) {
      const otherMethod = await prisma.paymentMethod.findFirst({
        where: {
          userId: user.id,
          stripePaymentMethodId: { not: paymentMethodId }
        }
      });

      if (otherMethod && user.stripeCustomerId) {
        await stripe.customers.update(
          user.stripeCustomerId,
          { 
            invoice_settings: { 
              default_payment_method: otherMethod.stripePaymentMethodId 
            } 
          }
        );

        await prisma.paymentMethod.update({
          where: { id: otherMethod.id },
          data: { isDefault: true }
        });
      }
    }

    // Eliminar el método de pago en Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Eliminar el método de pago en nuestra base de datos
    await prisma.paymentMethod.delete({
      where: { id: paymentMethod.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Método de pago eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    return NextResponse.json(
      { error: 'Error al eliminar método de pago' },
      { status: 500 }
    );
  }
} 