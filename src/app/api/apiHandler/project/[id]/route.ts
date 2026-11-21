import { NextResponse } from "next/server";
import { prisma } from "@/lib/utils";
import { deleteImage } from "@/lib/uploads";
import { getSessionUserId, parseProject, prismaErrorResponse, unauthorized } from "../shared";

type Params = { params: Promise<{ id: string }> };

// Only the owner of the project can change it.
async function findOwnedProject(id: string, userId: string) {
  return prisma.project.findFirst({ where: { id, userId }, select: { id: true, image: true } });
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const { data, error } = parseProject(await request.json(), userId);
  if (!data) return NextResponse.json({ error }, { status: 400 });
  const existing = await findOwnedProject(id, userId);
  if (!existing) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
 
  try {
    const project = await prisma.project.update({ where: { id }, data });
    if (existing.image !== data.image) await deleteImage(existing.image);
    return NextResponse.json({ resultado: { success: true, data: project } });
  } catch (e) {
    return prismaErrorResponse(e);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const existing = await findOwnedProject(id, userId);
  if (!existing) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  try {
    await prisma.project.delete({ where: { id } });
    await deleteImage(existing.image);
    return NextResponse.json({ resultado: { success: true } });
  } catch (e) {
    return prismaErrorResponse(e);
  }
}
