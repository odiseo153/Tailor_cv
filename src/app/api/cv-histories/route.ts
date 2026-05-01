import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/utils";

const allowedStatuses = ["pending", "applied", "interview", "rejected", "hired"];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const histories = await prisma.cv_histories.findMany({
    where: {
      userId: session.user.id,
      ...(status && allowedStatuses.includes(status) ? { status } : {}),
      ...((from || to)
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    },
    include: {
      cv_template: {
        select: {
          id: true,
          name: true,
          preview_image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ histories });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const htmlData = typeof body?.htmlData === "string" ? body.htmlData.trim() : "";
  const offer = typeof body?.offer === "string" ? body.offer.trim() : "";
  const templateId =
    typeof body?.cvTemplateId === "string" ? body.cvTemplateId.trim() : null;

  if (!htmlData || !offer) {
    return NextResponse.json(
      { error: "htmlData and offer are required" },
      { status: 400 },
    );
  }

  const history = await prisma.cv_histories.create({
    data: {
      userId: session.user.id,
      html_data: htmlData,
      offer,
      cv_template_id: templateId || null,
    },
    include: {
      cv_template: {
        select: {
          id: true,
          name: true,
          preview_image: true,
        },
      },
    },
  });

  return NextResponse.json({ history }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const status = typeof body?.status === "string" ? body.status.trim() : "";

  if (!id || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
  }

  const history = await prisma.cv_histories.updateMany({
    where: {
      id,
      userId: session.user.id,
    },
    data: { status },
  });

  return NextResponse.json({ success: history.count > 0 });
}
