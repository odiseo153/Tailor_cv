import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID de preferencia requerido'
      }, { status: 400 });
    }

    // Actualizar preferencia
    const updatedPreference = await prisma.cvPreferences.update({
      where: { id },
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

  } catch (error: any) {
    console.error("Error actualizando preferencias de CV:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al actualizar preferencias: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID de preferencia requerido'
      }, { status: 400 });
    }

    // Eliminar preferencia
    await prisma.cvPreferences.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      resultado: {
        message: "Preferencias de CV eliminadas correctamente"
      }
    });

  } catch (error: any) {
    console.error("Error eliminando preferencias de CV:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al eliminar preferencias: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 