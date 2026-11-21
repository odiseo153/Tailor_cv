// Seeder del perfil personal de Odiseo Rincon.
// Uso: SEED_ODISEO_PASSWORD='...' npm run seed:odiseo
//
// Estrategia idempotente y no destructiva:
// - El usuario se crea si no existe. Si existe, solo se rellenan campos vacíos
//   (nunca se sobrescriben datos editados desde /profile ni la contraseña ya definida),
//   salvo con SEED_ODISEO_OVERWRITE=true, que reescribe datos personales y contraseña.
// - Experiencias, proyectos, habilidades, educación y enlaces solo se crean si no
//   existe ya un registro del usuario con la misma clave natural.
// - Nunca se eliminan registros.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const EMAIL = 'odiseorincon@gmail.com';

// FECHAS MARCADOR: el schema exige startDate y no hay fechas confirmadas.
// Reemplázalas aquí o desde /profile por las fechas reales.
const PLACEHOLDER_START = new Date('2024-01-15T12:00:00Z');
const PLACEHOLDER_END = new Date('2024-12-15T12:00:00Z');

const profile = {
  name: 'Odiseo Esmerlin Rincon Sanchez',
  phone: '+1 829-789-0766',
  location: 'Santo Domingo Este, Santo Domingo, República Dominicana',
  headline: 'Full Stack Developer | Backend Developer | .NET & Laravel',
  summary: `Desarrollador de software Full Stack con experiencia en el diseño, desarrollo e integración de aplicaciones web, APIs REST y sistemas empresariales. Especializado en tecnologías backend como C#, ASP.NET Core, .NET y Laravel, con conocimientos sólidos en React, Next.js, Angular y bases de datos relacionales.

Experiencia implementando sistemas de gestión clínica, facturación electrónica, plataformas administrativas, automatización de procesos e integraciones con servicios externos.

Conocimientos en arquitecturas Clean, Hexagonal y Onion, autenticación y autorización, desarrollo de soluciones escalables, optimización de consultas y despliegue de aplicaciones.

También cuento con formación en inteligencia artificial, machine learning y desarrollo de soluciones utilizando Python.

Me interesa continuar desarrollándome profesionalmente en ingeniería de software, especialmente en backend, arquitectura de sistemas y soluciones empresariales.`,
};

const bullets = (items) => items.map((item) => `- ${item}`).join('\n');

const workExperience = [
  {
    company: 'ANR Paraguay',
    jobTitle: 'Desarrollador de Software Freelance',
    description: `Modalidad: Remoto / Freelance. Duración aproximada: 1 año.\n${bullets([
      'Desarrollo y mantenimiento de aplicaciones web.',
      'Implementación de funcionalidades backend.',
      'Integración de servicios y APIs.',
      'Trabajo con bases de datos y lógica de negocio.',
      'Resolución de incidencias y mejoras funcionales.',
    ])}`,
  },
  {
    company: 'Ayuntamiento de Santo Domingo Este (ASDE)',
    jobTitle: 'Pasante de Desarrollo de Software',
    description: `Modalidad: Pasantía. Tecnologías: C#, .NET, ASP.NET Core, SQL Server.\n${bullets([
      'Desarrollo de funcionalidades para sistemas institucionales.',
      'Implementación y mantenimiento de componentes backend.',
      'Consultas y operaciones con SQL Server.',
      'Corrección de errores y soporte técnico a aplicaciones.',
    ])}`,
  },
  {
    company: 'AddTo',
    jobTitle: 'Desarrollo de Software e Inteligencia Artificial',
    description: `Tecnologías: Python, Flask, inteligencia artificial.\n${bullets([
      'Desarrollo de soluciones backend utilizando Flask.',
      'Implementación e integración de funcionalidades relacionadas con IA.',
      'Procesamiento de datos y desarrollo de servicios.',
    ])}`,
  },
].map((item) => ({ ...item, startDate: PLACEHOLDER_START, endDate: PLACEHOLDER_END }));

const PROFESSIONAL_ROLE = 'Proyecto profesional — Desarrollador Full Stack / Backend';
const PORTFOLIO_ROLE = 'Proyecto de portafolio';

const projects = [
  {
    name: 'Quirocita v2',
    role: PROFESSIONAL_ROLE,
    technologies: 'Laravel, Next.js, MySQL, WebSockets, Laravel Reverb, Laravel Echo',
    description: `Sistema de gestión clínica.\n${bullets([
      'Gestión de pacientes, citas, servicios, planes y autorizaciones.',
      'Reportes administrativos y productividad.',
      'Integración de eventos en tiempo real con Laravel Reverb y Echo.',
      'Automatización de citas programadas.',
      'Seguridad basada en roles, permisos y sucursales.',
      'Optimización de consultas y rendimiento.',
    ])}`,
  },
  {
    name: 'VetPro',
    role: PROFESSIONAL_ROLE,
    technologies: null,
    description: `Sistema de gestión de procesos clínicos y facturación.\n${bullets([
      'Implementación de flujos Invoice, Re-check, Soap Note, Audition y Approved to Bill.',
      'Gestión de Denial Review.',
      'Validaciones de facturación TRICARE/FMP.',
      'Manejo de estados y procesos de revisión.',
      'Automatización y reprocesamiento de facturas.',
    ])}`,
  },
  {
    name: 'Sistema de facturación electrónica DGII',
    role: PROFESSIONAL_ROLE,
    technologies: 'PHP, XML, XSD, RSA-SHA256, APIs REST',
    description: `Implementación de procesos de facturación electrónica en República Dominicana.\n${bullets([
      'Generación, validación y firma digital de XML e-CF.',
      'Integración con servicios de autenticación, recepción y consulta de la DGII.',
      'Procesamiento de respuestas, TrackId y estados.',
      'Implementación de flujos de certificación y aprobaciones comerciales.',
    ])}`,
  },
  {
    name: 'TailorCV',
    role: PORTFOLIO_ROLE,
    technologies: 'Next.js, React, Prisma, IA',
    description:
      'Plataforma web para crear y personalizar currículums utilizando inteligencia artificial, con funcionalidades de gestión de perfiles, plantillas, generación de CV y búsqueda de empleos.',
  },
  {
    name: 'Shopy Smart',
    role: PORTFOLIO_ROLE,
    technologies: 'Next.js, React, TypeScript',
    description:
      'Aplicación web de comercio electrónico desarrollada con Next.js 19, orientada a la gestión de productos y experiencias de compra.',
  },
  {
    name: 'Gym API',
    role: PORTFOLIO_ROLE,
    technologies: 'Laravel, PHP, arquitectura hexagonal',
    description: 'API para gestión de gimnasios, desarrollada con Laravel y arquitectura hexagonal.',
  },
  {
    name: 'MediBooking',
    role: PORTFOLIO_ROLE,
    technologies: '.NET, ASP.NET Core, React, SQL Server',
    description: 'Sistema de gestión y reserva de citas médicas.',
  },
  {
    name: 'Blog API',
    role: PORTFOLIO_ROLE,
    technologies: 'Laravel, PHP',
    description: 'API REST para la administración de contenido de un blog.',
  },
  {
    name: 'WhatsApp Clone',
    role: PORTFOLIO_ROLE,
    technologies: '.NET, SignalR, React',
    description: 'Aplicación de mensajería en tiempo real con comunicación mediante WebSockets.',
  },
  {
    name: 'Plataforma de gestión de incidentes y retención vehicular',
    role: PORTFOLIO_ROLE,
    technologies: 'Node.js, TypeScript, Prisma, React Native',
    description: `Solución con aplicaciones móviles para agentes, grueros y clientes, y panel administrativo para backoffice.\n${bullets([
      'Reportes de incidentes.',
      'Registro fotográfico.',
      'Asignación de grúas.',
      'Seguimiento de vehículos.',
      'Gestión de usuarios y roles.',
      'Consulta de retenciones y pagos.',
    ])}`,
  },
];

// Niveles conservadores (1-5). Nadie recibe 5 salvo el idioma nativo.
// Los idiomas se guardan como skills: candidate-profile.ts los separa por nombre.
const skillGroups = {
  4: [
    'C#', '.NET 6, 7 y 8', 'ASP.NET Core', 'Entity Framework Core', 'PHP', 'Laravel 11',
    'REST API Development', 'Microsoft SQL Server', 'MySQL', 'Git', 'GitHub',
    'Inglés (B2–C1, intermedio alto a avanzado)',
  ],
  3: [
    'Dapper', 'ASP.NET Identity', 'MediatR', 'FluentValidation', 'JWT', 'SignalR',
    'Laravel Sanctum', 'Laravel Policies / Gates', 'Node.js', 'TypeScript', 'Python', 'Flask',
    'React.js', 'Next.js', 'Angular', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap',
    'shadcn/ui', 'Responsive Web Design',
    'PostgreSQL', 'MariaDB', 'Prisma ORM',
    'Clean Architecture', 'Hexagonal Architecture', 'Onion Architecture', 'SOLID',
    'Repository Pattern', 'Dependency Injection', 'MVC', 'API Design',
    'Authentication & Authorization', 'Role-Based Access Control',
    'Docker', 'Docker Compose', 'Linux / Fedora', 'Postman', 'VS Code',
    'Resolución de problemas', 'Pensamiento analítico', 'Trabajo en equipo',
    'Diseño de soluciones', 'Integración de sistemas', 'Documentación técnica',
  ],
  2: [
    'Oracle Database', 'MongoDB', 'Supabase', 'Neon', 'Multi-tenancy',
    'GitHub Actions', 'CI/CD', 'Azure DevOps', 'IIS', 'Plesk', 'Vercel', 'Netlify', 'Render',
    'SSH', 'Cloudflare',
    'TensorFlow', 'Keras', 'scikit-learn', 'XGBoost', 'NLTK', 'spaCy', 'Machine Learning',
    'Natural Language Processing', 'Pandas', 'NumPy', 'Google Colab',
    'Cursor', 'Zed', 'n8n', 'Codex', 'OpenCode',
    'Metodologías ágiles', 'Scrum', 'Optimización de rendimiento',
  ],
};
const skills = [
  { name: 'Español (Nativo)', level: 5 },
  ...Object.entries(skillGroups).flatMap(([level, names]) =>
    names.map((name) => ({ name, level: Number(level) })),
  ),
];

const education = [
  {
    institution: 'Instituto Tecnológico de Las Américas (ITLA), República Dominicana',
    degree: 'Tecnología de la Información / Desarrollo de Software',
  },
  {
    institution: 'Universidad del Caribe (UNICARIBE), República Dominicana',
    degree: 'Ingeniería de Software',
  },
].map((item) => ({ ...item, startDate: PLACEHOLDER_START, endDate: null }));

// Valores de plataforma en minúsculas: los que usa SocialLinksOptimized (no tiene opción email).
const socialLinks = [
  { platform: 'Email', url: `mailto:${EMAIL}` },
  { platform: 'github', url: 'https://github.com/odiseo153' },
  { platform: 'linkedin', url: 'https://www.linkedin.com/in/odiseo-esmerlin-rincon-sanchez-48053524b/' },
];

// Crea solo los elementos cuya clave natural no existe todavía para el usuario.
async function createMissing(delegate, userId, items, keyOf) {
  const existing = await delegate.findMany({ where: { userId } });
  const existingKeys = new Set(existing.map(keyOf));
  const missing = items.filter((item) => !existingKeys.has(keyOf(item)));
  if (missing.length > 0) {
    await delegate.createMany({ data: missing.map((item) => ({ ...item, userId })) });
  }
  return missing.length;
}

async function main() {
  const plainPassword = process.env.SEED_ODISEO_PASSWORD;
  if (!plainPassword) {
    throw new Error('Define SEED_ODISEO_PASSWORD con la contraseña inicial antes de ejecutar este seeder.');
  }

  let user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    // Mismo hashing que AuthHandler.register (bcryptjs, 12 salt rounds).
    const password = await bcrypt.hash(plainPassword, 12);
    user = await prisma.user.create({ data: { ...profile, email: EMAIL, password } });
    console.log('Usuario creado.');
  } else {
    // SEED_ODISEO_OVERWRITE=true: actualización explícita de datos personales y contraseña.
    const overwrite = process.env.SEED_ODISEO_OVERWRITE === 'true';
    const fill = {};
    for (const [field, value] of Object.entries(profile)) {
      if (overwrite || !user[field]) fill[field] = value;
    }
    // Usuarios creados por OAuth tienen password vacío: habilitar login con credenciales.
    if (overwrite || !user.password) fill.password = await bcrypt.hash(plainPassword, 12);
    if (Object.keys(fill).length > 0) {
      user = await prisma.user.update({ where: { id: user.id }, data: fill });
    }
    console.log(`Usuario existente. Campos completados: ${Object.keys(fill).filter((f) => f !== 'password').join(', ') || 'ninguno'}.`);
  }

  const counts = {
    experiencias: await createMissing(prisma.workExperience, user.id, workExperience, (w) => `${w.company}|${w.jobTitle}`),
    proyectos: await createMissing(prisma.project, user.id, projects, (p) => p.name),
    habilidades: await createMissing(prisma.skill, user.id, skills, (s) => s.name.toLowerCase()),
    educacion: await createMissing(prisma.education, user.id, education, (e) => e.institution),
    enlaces: await createMissing(prisma.socialLink, user.id, socialLinks, (l) => l.platform.toLowerCase()),
  };

  console.log('Registros nuevos:', counts);
}

main()
  .catch((e) => {
    console.error('Error ejecutando seed de perfil:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
