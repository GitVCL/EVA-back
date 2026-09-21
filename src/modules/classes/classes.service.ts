import { prisma } from '../../config/prisma';
import { z } from 'zod';

export const classCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(480).default(60),
  active: z.boolean().default(true),
});

export const classUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
  active: z.boolean().optional(),
});

export class ClassesService {
  static async list(options: { onlyActive?: boolean } = {}) {
    const { onlyActive = true } = options;
    return prisma.class.findMany({
      where: onlyActive ? { active: true } : undefined,
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });
  }

  static async create(data: z.infer<typeof classCreateSchema>) {
    return prisma.class.create({ data });
  }

  static async update(id: number, data: z.infer<typeof classUpdateSchema>) {
    return prisma.class.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.class.delete({ where: { id } });
  }
}
