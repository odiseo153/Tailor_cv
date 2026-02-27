import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = 'uploads/profile';
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'El archivo no puede superar 2MB' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten imágenes (JPG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase()) ? ext : '.jpg';
    const fileName = `${userId}-${Date.now()}${safeExt}`;
    const dirPath = path.join(process.cwd(), 'public', UPLOAD_DIR);
    const filePath = path.join(dirPath, fileName);

    await fs.promises.mkdir(dirPath, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    const url = `/${UPLOAD_DIR}/${fileName}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
