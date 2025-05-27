import {  NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function GET() {
  try {
    const data = await stripe.products.list();
    const dataWithPrices = await Promise.all(data.data.map(async (product) => {
      const price = await stripe.prices.list({
        product: product.id,
        limit: 1
      });
      return { ...product, default_price: price.data[0] };
    }));

    return NextResponse.json({ data: dataWithPrices });
  } catch (error) {
    console.error('Error al obtener planes de suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener planes de suscripción' },
      { status: 500 }
    );
  }
} 


