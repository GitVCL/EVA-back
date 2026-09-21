import express from 'express';
import { corsConfig } from './config/cors';
import { env } from './config/env';

import { classesRouter } from './modules/classes/classes.routes';
import { schedulesRouter } from './modules/schedules/schedules.routes';
import { studentsRouter } from './modules/students/students.routes';
import { appointmentsRouter } from './modules/appointments/appointments.routes';

export const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(corsConfig);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'backend',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/classes', classesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/appointments', appointmentsRouter);

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Rota nao encontrada' });
});
