import { Router } from 'express';
import { AppointmentsController } from './appointments.controller';
import { authenticate, requireAdmin } from '../../middleware/jwt.middleware';

export const appointmentsRouter = Router();

appointmentsRouter.post('/', AppointmentsController.create);
appointmentsRouter.get('/', authenticate, requireAdmin, AppointmentsController.list);
appointmentsRouter.patch('/:id/status', authenticate, requireAdmin, AppointmentsController.updateStatus);
