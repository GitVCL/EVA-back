import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { StudentsService, studentSchema } from '../students/students.service';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TZ = 'America/Sao_Paulo';

const VALID_STATUSES = ['confirmed', 'cancelled', 'attended', 'missed'] as const;

export const bookingSchema = z.object({
  scheduleId: z.coerce.number().int().min(1),
  student: studentSchema,
  notes: z.string().max(500).optional().nullable(),
});

export const statusSchema = z.object({
  status: z.enum(VALID_STATUSES),
});

export class AppointmentsService {
  static async create(input: z.infer<typeof bookingSchema>) {
    const now = toZonedTime(new Date(), TZ);

    const schedule = await prisma.schedule.findUnique({
      where: { id: input.scheduleId },
      include: {
        class: true,
        appointments: {
          where: { status: { in: ['confirmed', 'attended'] } },
          select: { studentId: true, status: true },
        },
      },
    });

    if (!schedule) return { ok: false as const, error: 'Horario nao existe', code: 404 };
    if (!schedule.active || !schedule.class.active) {
      return { ok: false as const, error: 'Horario/aula nao esta ativo', code: 410 };
    }
    if (isBefore(schedule.date, startOfDay(now))) {
      return { ok: false as const, error: 'Horario ja passou', code: 410 };
    }
    if (schedule.appointments.length >= schedule.capacity) {
      return { ok: false as const, error: 'Horario lotado', code: 409 };
    }

    const student = await StudentsService.findOrCreate(input.student);

    const dup = await prisma.appointment.findUnique({
      where: {
        scheduleId_studentId: { scheduleId: schedule.id, studentId: student.id },
      },
    });
    if (dup) {
      return { ok: false as const, error: 'Voce ja tem agendamento para este horario', code: 409 };
    }

    try {
      const appointment = await prisma.appointment.create({
        data: {
          studentId: student.id,
          scheduleId: schedule.id,
          status: 'confirmed',
          notes: input.notes || null,
        },
        include: {
          student: true,
          schedule: { include: { class: true } },
        },
      });
      return { ok: true as const, data: appointment };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return { ok: false as const, error: 'Agendamento duplicado', code: 409 };
      }
      throw err;
    }
  }

  static async list(options: { status?: string; from?: string; to?: string } = {}) {
    const { status, from, to } = options;
    const where: any = {};
    if (status) where.status = status;
    if (from || to) {
      where.schedule = {} as any;
      if (from) where.schedule.date = { gte: parseISO(from) };
      if (to) where.schedule.date = { ...(where.schedule.date || {}), lte: parseISO(to) };
    }

    return prisma.appointment.findMany({
      where,
      include: {
        student: true,
        schedule: { include: { class: true } },
      },
      orderBy: [
        { schedule: { date: 'desc' } },
        { schedule: { startTime: 'asc' } },
      ],
    });
  }

  static async updateStatus(id: number, status: (typeof VALID_STATUSES)[number]) {
    const exists = await prisma.appointment.findUnique({ where: { id } });
    if (!exists) return { ok: false as const, error: 'Agendamento nao existe', code: 404 };

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { student: true, schedule: { include: { class: true } } },
    });
    return { ok: true as const, data: updated };
  }
}
