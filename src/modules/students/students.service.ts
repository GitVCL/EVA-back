import { prisma } from '../../config/prisma';
import { z } from 'zod';

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^55/, '');
}

export const studentSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10, 'Telefone invalido').max(20),
  email: z.string().email('E-mail invalido').optional().nullable(),
});

export class StudentsService {
  static async findOrCreate(input: z.infer<typeof studentSchema>) {
    const phone = normalizePhone(input.phone);
    let student = await prisma.student.findUnique({ where: { phone } });

    if (!student) {
      student = await prisma.student.create({
        data: {
          name: input.name.trim(),
          phone,
          email: input.email?.trim() || null,
        },
      });
    } else {
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          name: input.name.trim(),
          email: input.email?.trim() || null,
        },
      });
    }
    return student;
  }

  static async list() {
    return prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { appointments: true } } },
    });
  }

  static async findByPhone(phone: string) {
    return prisma.student.findUnique({
      where: { phone: normalizePhone(phone) },
      include: {
        appointments: {
          include: { schedule: { include: { class: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
