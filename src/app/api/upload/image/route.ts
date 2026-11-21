import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IMAGE_FOLDERS, ImageFolder, saveImage, validateImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder") as ImageFolder;

  if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  if (!IMAGE_FOLDERS.includes(folder)) return NextResponse.json({ error: "Carpeta inválida" }, { status: 400 });
  const error = validateImage(file);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    return NextResponse.json({ url: await saveImage(file, folder, userId) });
  } catch (e) {
    console.error("Image upload error:", e);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
