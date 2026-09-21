import { Router } from 'express';
import { SchedulesController } from './schedules.controller';
import { authenticate, requireAdmin } from '../../middleware/jwt.middleware';

export const schedulesRouter = Router();

schedulesRouter.get('/available', SchedulesController.listAvailable);
schedulesRouter.get('/', authenticate, requireAdmin, SchedulesController.listAll);
schedulesRouter.post('/', authenticate, requireAdmin, SchedulesController.create);
schedulesRouter.patch('/:id', authenticate, requireAdmin, SchedulesController.update);
