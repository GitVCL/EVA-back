import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function bootstrap() {
  try {
    if (env.MOCK_MODE) {
      console.log('🧪 [BACKEND] MOCK MODE ATIVO - MySQL ignorado');
    } else {
      await prisma.$connect();
      console.log('✅ Prisma conectado ao MySQL');
    }

    app.listen(env.PORT, () => {
      console.log(`🚀 EVA ATELIÊ backend rodando em http://localhost:${env.PORT}`);
      console.log(`   Ambiente:  ${env.NODE_ENV} | Mock: ${env.MOCK_MODE ? 'SIM' : 'NAO'}`);
      console.log(`   Health:    http://localhost:${env.PORT}/api/health`);
      console.log(`   Aulas:     http://localhost:${env.PORT}/api/classes`);
      console.log(`   Horários:  http://localhost:${env.PORT}/api/schedules/available`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar servidor:', err);
    process.exit(1);
  }
}

bootstrap();
