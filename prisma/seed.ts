import { prisma } from '../src/config/prisma';

async function seed() {
  console.log('🌱 [BACKEND] Iniciando seed (aulas exemplo)...');

  const c1 = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Desenho Realista',
      description: 'Aprenda técnicas de sombreamento, luz e sombra para criar retratos e objetos com aparência realista. Lápis grafite, carvão e esfuminho.',
      level: 'Iniciante',
      durationMinutes: 90,
      maxCapacity: 6,
      priceCents: 8000,
      active: true,
    },
  });
  const c2 = await prisma.class.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Mangá & Anime',
      description: 'Desenhe personagens no estilo japonês: proporções, expressões, olhar animado, poses dinâmicas e cenários. Do esboço ao acabamento com nanquim/marcador.',
      level: 'Intermediário',
      durationMinutes: 90,
      maxCapacity: 8,
      priceCents: 7500,
      active: true,
    },
  });
  const c3 = await prisma.class.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Aquarela para Iniciantes',
      description: 'Mistura de cores, molhagem do papel, degradê, lavagens e texturas com tinta aquarela. Pintura de paisagens e natureza morta.',
      level: 'Iniciante',
      durationMinutes: 120,
      maxCapacity: 5,
      priceCents: 12000,
      active: true,
    },
  });
  const c4 = await prisma.class.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Figura Humana',
      description: 'Estudo de gesto, proporção áurea, anatomia básica (esqueleto e músculos) e movimento.',
      level: 'Avançado',
      durationMinutes: 120,
      maxCapacity: 6,
      priceCents: 15000,
      active: true,
    },
  });
  const c5 = await prisma.class.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Lettering & Tipografia',
      description: 'Criação de composições manuais com letras, brush pen, efeitos 3D e dourados.',
      level: 'Iniciante',
      durationMinutes: 90,
      maxCapacity: 8,
      priceCents: 7000,
      active: false,
    },
  });
  console.log(`✅ ${[c1, c2, c3, c4, c5].length} aulas criadas/atualizadas`);
  console.log('🌱 Seed finalizado!');
  console.log('');
  console.log('⚠️  Admin agora é criado no serviço AUTH separado:');
  console.log('   Rode: cd ../auth && npm run seed');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
