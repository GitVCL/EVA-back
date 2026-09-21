import dotenv from 'dotenv';
import { z, preprocess } from 'zod';

dotenv.config();

const raw = process.env;

function parseBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'sim';
  }
  return false;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  MOCK_MODE: preprocess(parseBool, z.boolean().default(false)),
  DATABASE_URL: parseBool(raw.MOCK_MODE)
    ? z.string().optional().default('postgresql://mock:mock@localhost:5432/mock')
    : z.string().min(1, 'DATABASE_URL nao definida'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  TZ: z.string().default('America/Sao_Paulo'),
  SEED_ADMIN_NAME: z.string().optional(),
  SEED_ADMIN_EMAIL: z.string().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(raw);
