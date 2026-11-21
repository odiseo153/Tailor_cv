import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isOwnImageUrl } from "@/lib/uploads";

export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const optional = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

// Validates and normalizes the editable project fields.
export function parseProject(
  body: any,
  userId: string
): { data?: { name: string; role: string | null; description: string | null; technologies: string | null; image: string | null }; error?: string } {
  const name = optional(body?.name);
  if (!name) return { error: "El nombre del proyecto es requerido" };
  const image = optional(body.image);
  if (image && !isOwnImageUrl(image, userId)) return { error: "Imagen inválida" };
  return {
    data: {
      name,
      role: optional(body.role),
      description: optional(body.description),
      technologies: optional(body.technologies),
      image,
    },
  };
}

export function prismaErrorResponse(error: any) {
  if (error?.code === "P2002") {
    return NextResponse.json({ error: "Ya existe un proyecto con ese nombre" }, { status: 409 });
  }
  console.error("Project operation failed:", error);
  return NextResponse.json({ error: "Error al procesar el proyecto" }, { status: 500 });
}
