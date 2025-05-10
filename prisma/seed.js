import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el seed...');

  // Crear usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Juan Pérez',
      email: 'test@example.com',
      phone: '+1 809 555 1234',
      password: 'password',
      location: 'Santo Domingo, RD',
      profilePicture: 'https://wallpapers.com/images/hd/cute-boy-anime-736-x-1444-0v2pmz8r4n8qi3hs.jpg',
      workExperience: {
        create: [
          {
            company: 'Tech Corp',
            jobTitle: 'Software Engineer',
            startDate: new Date('2022-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Desarrollé soluciones escalables con Next.js y Node.js.',
          },
        ],
      },
      skills: {
        create: [
          { name: 'JavaScript', level: 5 },
          { name: 'React', level: 4 },
          { name: 'Node.js', level: 4 },
        ],
      },
      education: {
        create: [
          {
            institution: 'Instituto Tecnológico de las Américas (ITLA)',
            degree: 'Ingeniería en Software',
            startDate: new Date('2019-08-01'),
            endDate: new Date('2023-05-01'),
          },
        ],
      },
      socialLinks: {
        create: [
          { platform: 'Twitter', url: 'https://twitter.com/juanperez' },
          { platform: 'GitHub', url: 'https://github.com/juanperez' },
        ],
      },
      cvPreferences: {
        create: {
          template: 'modern',
          primaryColor: '#2563eb',
          secondaryColor: '#3b82f6',
          fontFamily: 'Arial',
          fontSize: 'medium',
          spacing: 1,
          showPhoto: true,
          showContact: true,
          showSocial: true,
          pageSize: 'a4',
        },
      },
    },
  });

  console.log('✅ Seed ejecutado correctamente. Usuario creado:', user);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  