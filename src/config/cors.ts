import cors from 'cors';
import { env } from './env';

export const corsConfig = cors({
  origin: (origin, callback) => {
    if (env.NODE_ENV === 'development' || !origin) {
      return callback(null, true);
    }
    const allowed = env.CORS_ORIGIN.split(',').map((o) => o.trim());
    if (allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('CORS nao autorizado'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
