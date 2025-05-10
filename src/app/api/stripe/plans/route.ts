import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los planes de suscripción activos
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error al obtener planes de suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener planes de suscripción' },
      { status: 500 }
    );
  }
} 