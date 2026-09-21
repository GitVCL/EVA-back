import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

let prismaConnected = false;

async function bootstrap() {
  try {
    if (env.MOCK_MODE) {
      console.log('🧪 [BACKEND] MOCK MODE ATIVO');
      prismaConnected = true;
    } else {
      try {
        await prisma.$connect();
        prismaConnected = true;
        console.log('✅ [BACKEND] Prisma conectado ao PostgreSQL Railway');
      } catch (dbErr) {
        console.error('⚠️ [BACKEND] AVISO: Prisma NAO conectou ainda. Servidor vai subir para HEALTHCHECK, tentando reconectar...', (dbErr as Error).message);
        prismaConnected = false;
      }
    }

    app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`🚀 EVA ATELIÊ backend rodando em 0.0.0.0:${env.PORT}`);
      console.log(`   Ambiente:  ${env.NODE_ENV} | Mock: ${env.MOCK_MODE ? 'SIM' : 'NAO'} | Prisma OK: ${prismaConnected ? 'SIM' : 'NAO'}`);
      console.log(`   Health:    http://0.0.0.0:${env.PORT}/api/health`);
      console.log(`   Aulas:     http://0.0.0.0:${env.PORT}/api/classes`);
      console.log(`   Horários:  http://0.0.0.0:${env.PORT}/api/schedules/available`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar servidor:', err);
    process.exit(1);
  }
}

bootstrap();
