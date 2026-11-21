import { NextResponse } from "next/server";
import { prisma } from "@/lib/utils";
import { getSessionUserId, parseProject, prismaErrorResponse, unauthorized } from "./shared";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { data, error } = parseProject(await request.json(), userId);
  if (!data) return NextResponse.json({ error }, { status: 400 });

  try {
    const project = await prisma.project.create({ data: { ...data, userId } });
    return NextResponse.json({ resultado: { success: true, data: project } });
  } catch (e) {
    return prismaErrorResponse(e);
  }
}
