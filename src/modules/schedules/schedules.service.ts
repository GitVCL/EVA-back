import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TZ = 'America/Sao_Paulo';
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduleCreateSchema = z.object({
  classId: z.coerce.number().int().min(1),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Data invalida'),
  startTime: z.string().regex(TIME_REGEX, 'Hora inicial invalida (HH:MM)'),
  endTime: z.string().regex(TIME_REGEX, 'Hora final invalida (HH:MM)'),
  capacity: z.coerce.number().int().min(1).default(1),
  active: z.boolean().default(true),
});

export const scheduleUpdateSchema = z.object({
  classId: z.coerce.number().int().min(1).optional(),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Data invalida').optional(),
  startTime: z.string().regex(TIME_REGEX, 'Hora inicial invalida (HH:MM)').optional(),
  endTime: z.string().regex(TIME_REGEX, 'Hora final invalida (HH:MM)').optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  active: z.boolean().optional(),
});

export class SchedulesService {
  static async listAvailable(options: { from?: string; to?: string; classId?: number } = {}) {
    const { from, to, classId } = options;
    const today = startOfDay(new Date());

    const where: any = {
      active: true,
      class: { active: true },
      date: { gte: today },
    };
    if (from) where.date.gte = parseISO(from);
    if (to) where.date.lte = parseISO(to);
    if (classId) where.classId = classId;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, durationMinutes: true } },
        _count: { select: { appointments: { where: { status: { in: ['confirmed', 'attended'] } } } } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return schedules
      .map((s) => ({
        ...s,
        booked: s._count.appointments,
        available: s.capacity - s._count.appointments > 0,
        _count: undefined,
      }))
      .filter((s) => s.available);
  }

  static async listAll() {
    return prisma.schedule.findMany({
      include: {
        class: { select: { id: true, name: true, durationMinutes: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
    });
  }

  static async create(dataInput: z.infer<typeof scheduleCreateSchema>) {
    const dt = parseISO(dataInput.date);
    const now = toZonedTime(new Date(), TZ);

    if (isBefore(dt, startOfDay(now))) {
      return { ok: false as const, error: 'Data nao pode ser no passado', code: 400 };
    }

    if (dataInput.endTime <= dataInput.startTime) {
      return { ok: false as const, error: 'Hora final deve ser maior que a inicial', code: 400 };
    }

    const cls = await prisma.class.findUnique({ where: { id: dataInput.classId } });
    if (!cls) return { ok: false as const, error: 'Aula nao existe', code: 404 };

    try {
      const data = { ...dataInput, date: dt };
      const created = await prisma.schedule.create({ data });
      return { ok: true as const, data: created };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return { ok: false as const, error: 'Horario duplicado para esta aula e data', code: 409 };
      }
      throw err;
    }
  }

  static async update(id: number, dataInput: z.infer<typeof scheduleUpdateSchema>) {
    const has = await prisma.schedule.findUnique({ where: { id } });
    if (!has) return { ok: false as const, error: 'Horario nao existe', code: 404 };

    const data: any = { ...dataInput };
    if (dataInput.date) data.date = parseISO(dataInput.date);

    try {
      const updated = await prisma.schedule.update({ where: { id }, data });
      return { ok: true as const, data: updated };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return { ok: false as const, error: 'Horario duplicado', code: 409 };
      }
      throw err;
    }
  }
}
