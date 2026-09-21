import cors from 'cors';
import { env } from './env';

const CORS_ORIGIN_UNSET = !env.CORS_ORIGIN || env.CORS_ORIGIN.trim() === '';
const ALLOWED_WILDCARD = CORS_ORIGIN_UNSET || env.CORS_ORIGIN.includes('*');
const allowedList = CORS_ORIGIN_UNSET
  ? []
  : env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

const originFn = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (env.NODE_ENV === 'development' || !origin) return callback(null, true);
  if (ALLOWED_WILDCARD) return callback(null, true);
  if (allowedList.includes(origin)) return callback(null, true);
  callback(new Error(`CORS nao autorizado: ${origin}`));
};

export const corsConfig = cors({
  origin: originFn,
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400,
});
