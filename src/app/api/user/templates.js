export async function GET_TEMPLATES(userID: number) {
  return await prisma.cv_templates.findMany({
    where: { isPublic: true, authorId: { not: userID } },
    orderBy: [{ createdAt: "desc" }],
    include: { author: true }, // Incluye información del autor
  });
}

export async function GET_USER_TEMPLATES(userID: number) {
  return await prisma.cv_templates.findMany({
    where: { authorId: userID },
  });
}