import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/utils";

const defaultTemplateFiles = [
  {
    name: "Profesional Clásica",
    file: "plantilla.html",
    isDefault: true,
  },
  {
    name: "Dos Columnas",
    file: "plantilla2.html",
    isDefault: false,
  },
];

async function ensureDefaultTemplates() {
  const count = await prisma.cv_templates.count();
  if (count > 0) {
    return;
  }

  const templates = await Promise.all(
    defaultTemplateFiles.map(async ({ name, file, isDefault }) => {
      const templatePath = path.join(process.cwd(), "src", "templates", file);
      const templateHtml = await fs.promises.readFile(templatePath, "utf-8");

      return {
        name,
        template_html: templateHtml,
        is_default: isDefault,
      };
    }),
  );

  await prisma.cv_templates.createMany({ data: templates });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    await ensureDefaultTemplates();

    const templates = await prisma.cv_templates.findMany({
      orderBy: [{ is_default: "desc" }, { createdAt: "asc" }],
      include: {
        author: {
          select: { name: true, profilePicture: true },
        },
        ...(session?.user?.id
          ? {
              favorites: {
                where: { userId: session.user.id },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    return NextResponse.json({
      templates: templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        previewImage: template.preview_image,
        templateHtml: template.template_html,
        isDefault: template.is_default,
        isFavorite: "favorites" in template && template.favorites ? template.favorites.length > 0 : false,
        author: template.author || null,
      })),
    });
  } catch (error: any) {
    console.error("Error loading templates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the real DB user just in case the JWT session ID is stale
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const templateHtml =
      typeof body?.templateHtml === "string" ? body.templateHtml.trim() : "";
    const previewImage =
      typeof body?.previewImage === "string" ? body.previewImage.trim() : null;

    if (!name || !templateHtml) {
      return NextResponse.json(
        { error: "name and templateHtml are required" },
        { status: 400 },
      );
    }

    const template = await prisma.cv_templates.create({
      data: {
        name,
        template_html: templateHtml,
        preview_image: previewImage || null,
        authorId: dbUser.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create template" },
      { status: 500 },
    );
  }
}
