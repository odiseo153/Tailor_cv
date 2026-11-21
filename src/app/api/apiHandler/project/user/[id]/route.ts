import { NextResponse } from "next/server";
import { prisma } from "@/lib/utils";
import { getSessionUserId, unauthorized } from "../../shared";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  const { id } = await params;
  if (!userId || userId !== id) return unauthorized();

  const projects = await prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ success: true, projects });
}
