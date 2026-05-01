import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const templateId =
    typeof body?.templateId === "string" ? body.templateId.trim() : "";
  const favorite = body?.favorite !== false;

  if (!templateId) {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  }

  if (favorite) {
    await prisma.userFavoriteTemplate.upsert({
      where: {
        userId_templateId: {
          userId: session.user.id,
          templateId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        templateId,
      },
    });
  } else {
    await prisma.userFavoriteTemplate.deleteMany({
      where: {
        userId: session.user.id,
        templateId,
      },
    });
  }

  return NextResponse.json({ success: true });
}
