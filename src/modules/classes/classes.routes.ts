import { Router } from 'express';
import { ClassesController } from './classes.controller';
import { authenticate, requireAdmin } from '../../middleware/jwt.middleware';

export const classesRouter = Router();

classesRouter.get('/', ClassesController.list);
classesRouter.post('/', authenticate, requireAdmin, ClassesController.create);
classesRouter.patch('/:id', authenticate, requireAdmin, ClassesController.update);
