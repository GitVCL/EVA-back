import { Router } from 'express';
import { StudentsController } from './students.controller';
import { authenticate, requireAdmin } from '../../middleware/jwt.middleware';

export const studentsRouter = Router();

studentsRouter.use(authenticate, requireAdmin);

studentsRouter.get('/', StudentsController.list);
studentsRouter.get('/search', StudentsController.findByPhone);
