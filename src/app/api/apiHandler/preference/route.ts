import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.userId) {
      return NextResponse.json({ 
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Comprobar si ya existe una preferencia para este usuario
    const existingPreference = await prisma.cvPreferences.findFirst({
      where: { userId: data.userId }
    });

    if (existingPreference) {
      // Si existe, actualizar en lugar de crear
      const updatedPreference = await prisma.cvPreferences.update({
        where: { id: existingPreference.id },
        data: {
          template: data.template,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          fontFamily: data.fontFamily,
          fontSize: data.fontSize,
          spacing: data.spacing,
          showPhoto: data.showPhoto,
          showContact: data.showContact,
          showSocial: data.showSocial,
          pageSize: data.pageSize
        }
      });

      return NextResponse.json({
        success: true,
        resultado: {
          message: "Preferencias de CV actualizadas correctamente",
          data: updatedPreference
        }
      });
    }

    // Crear nueva preferencia
    const newPreference = await prisma.cvPreferences.create({
      data: {
        userId: data.userId,
        template: data.template || 'modern',
        primaryColor: data.primaryColor || '#2563eb',
        secondaryColor: data.secondaryColor || '#3b82f6',
        fontFamily: data.fontFamily || 'Inter',
        fontSize: data.fontSize || 'medium',
        spacing: data.spacing || 1,
        showPhoto: data.showPhoto !== undefined ? data.showPhoto : true,
        showContact: data.showContact !== undefined ? data.showContact : true,
        showSocial: data.showSocial !== undefined ? data.showSocial : true,
        pageSize: data.pageSize || 'a4'
      }
    });

    return NextResponse.json({
      success: true,
      resultado: {
        message: "Preferencias de CV creadas correctamente",
        data: newPreference
      }
    });

  } catch (error: any) {
    console.error("Error creando preferencias de CV:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al crear preferencias: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 