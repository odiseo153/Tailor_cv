import { NextRequest, NextResponse } from 'next/server';
import { getRequestIp } from '@/lib/utils';
import AuthHandler from '@/app/Handler/AuthHandler';
import { z } from 'zod';

// Schema de validación Zod para el registro
const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

// Instanciar AuthHandler
const authHandler = new AuthHandler();

export async function POST(req: NextRequest) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const body = await req.json();

    
    // Validar los datos con Zod
    const result = registerSchema.safeParse(body);
    console.log(result)
    if (!result.success) {
      const errorMessage = result.error.errors.map(error => error.message).join(', ');
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    
    // Obtener IP para registro y seguimiento
    const clientIp = getRequestIp(req) || 'unknown';
    
    // Registrar el usuario utilizando el AuthHandler mejorado
    const registerResult = await authHandler.register(name, email, password, clientIp);
    
    if (!registerResult.success) {
      return NextResponse.json(
        { success: false, error: registerResult.error },
        { status: 400 }
      );
    }

    // Si el registro fue exitoso, devolver usuario (sin contraseña)
    return NextResponse.json({
      success: true,
      user: registerResult.user
    }, { status: 201 });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud de registro' },
      { status: 500 }
    );
  }
}
