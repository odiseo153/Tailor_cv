const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el seed...');
  const password = await bcrypt.hash('password', 10);

  // Crear primer usuario de prueba
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { password },
    create: {
      name: 'Juan Pérez',
      email: 'test@example.com',
      phone: '+1 809 555 1234',
      password,
      location: 'Santo Domingo, RD',
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
          showPhoto: false,
          showContact: true,
          showSocial: true,
          pageSize: 'a4',
        },
      },
    },
  });

  // Crear segundo usuario de prueba
  await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: { password },
    create: {
      name: 'María González',
      email: 'maria@example.com',
      phone: '+1 809 555 5678',
      password,
      location: 'Santiago, RD',
      workExperience: {
        create: [
          {
            company: 'Digital Solutions',
            jobTitle: 'Frontend Developer',
            startDate: new Date('2021-06-01'),
            endDate: new Date('2024-02-01'),
            description: 'Desarrollé interfaces de usuario modernas con React y TypeScript.',
          },
        ],
      },
      skills: {
        create: [
          { name: 'TypeScript', level: 5 },
          { name: 'React', level: 5 },
          { name: 'CSS', level: 4 },
        ],
      },
      education: {
        create: [
          {
            institution: 'Universidad Autónoma de Santo Domingo (UASD)',
            degree: 'Ingeniería en Sistemas',
            startDate: new Date('2018-08-01'),
            endDate: new Date('2022-12-01'),
          },
        ],
      },
      socialLinks: {
        create: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/in/mariagonzalez' },
          { platform: 'GitHub', url: 'https://github.com/mariagonzalez' },
        ],
      },
      cvPreferences: {
        create: {
          template: 'classic',
          primaryColor: '#dc2626',
          secondaryColor: '#ef4444',
          fontFamily: 'Times New Roman',
          fontSize: 'small',
          spacing: 1.2,
          showPhoto: false,
          showContact: true,
          showSocial: true,
          pageSize: 'a4',
        },
      },
    },
  });

  // Crear tercer usuario de prueba
  await prisma.user.upsert({
    where: { email: 'carlos@example.com' },
    update: { password },
    create: {
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      phone: '+1 809 555 9012',
      password,
      location: 'La Vega, RD',
      workExperience: {
        create: [
          {
            company: 'Innovation Labs',
            jobTitle: 'Full Stack Developer',
            startDate: new Date('2020-03-01'),
            endDate: new Date('2023-12-01'),
            description: 'Desarrollé aplicaciones web completas usando MERN stack.',
          },
        ],
      },
      skills: {
        create: [
          { name: 'Python', level: 5 },
          { name: 'Django', level: 4 },
          { name: 'PostgreSQL', level: 4 },
        ],
      },
      education: {
        create: [
          {
            institution: 'Pontificia Universidad Católica Madre y Maestra (PUCMM)',
            degree: 'Ingeniería Telemática',
            startDate: new Date('2017-08-01'),
            endDate: new Date('2021-05-01'),
          },
        ],
      },
      socialLinks: {
        create: [
          { platform: 'Twitter', url: 'https://twitter.com/carlosrodriguez' },
          { platform: 'LinkedIn', url: 'https://linkedin.com/in/carlosrodriguez' },
        ],
      },
      cvPreferences: {
        create: {
          template: 'minimal',
          primaryColor: '#059669',
          secondaryColor: '#10b981',
          fontFamily: 'Helvetica',
          fontSize: 'large',
          spacing: 1.5,
          showPhoto: false,
          showContact: true,
          showSocial: true,
          pageSize: 'a4',
        },
      },
    },
  });

  console.log('✅ Seed ejecutado correctamente. Usuarios de prueba disponibles: 3');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
