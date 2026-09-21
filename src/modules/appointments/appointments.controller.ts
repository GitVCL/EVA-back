import { Request, Response } from 'express';
import { env } from '../../config/env';
import { mockStore } from '../../mock/store';
import { parseISO, startOfDay } from 'date-fns';
import { AppointmentsService, bookingSchema, statusSchema } from './appointments.service';

export class AppointmentsController {
  static async create(req: Request, res: Response) {
    try {
      const parsed = bookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors });
      }
      if (env.MOCK_MODE) {
        const raw = parsed.data as any;
        const schedule = mockStore.schedules.find((s) => s.id === raw.scheduleId);
        if (!schedule) return res.status(404).json({ ok: false, error: 'Horario nao encontrado' });
        if (schedule.bookedCount >= schedule.capacity) {
          return res.status(409).json({ ok: false, error: 'Turma lotada' });
        }
        const studentPhone: string = raw.phone ?? raw.student?.phone ?? '';
        const studentName: string = raw.studentName ?? raw.student?.name ?? 'Aluno';
        const studentEmail: string | null = raw.email ?? raw.student?.email ?? null;
        const duplicate = mockStore.appointments.find(
          (a) =>
            a.scheduleId === raw.scheduleId &&
            a.status !== 'cancelled' &&
            mockStore.students.find((s) => s.id === a.studentId)?.phone.replace(/\D/g, '') ===
              studentPhone.replace(/\D/g, ''),
        );
        if (duplicate) return res.status(409).json({ ok: false, error: 'Voce ja tem agendamento neste horario' });

        const student = mockStore.findOrCreateStudent(
          studentName,
          studentPhone,
          studentEmail,
        );
        const created = {
          id: mockStore.nextAppointmentId(),
          scheduleId: schedule.id,
          studentId: student.id,
          classId: schedule.classId,
          status: 'confirmed',
          notes: raw.notes ?? null,
          createdAt: new Date(),
        };
        schedule.bookedCount += 1;
        mockStore.appointments.push(created);
        const classEntity = mockStore.classes.find((c) => c.id === schedule.classId);
        return res.status(201).json({
          ok: true,
          data: {
            ...created,
            student,
            schedule: { ...schedule, class: classEntity ?? null },
          },
        });
      }
      const result = await AppointmentsService.create(parsed.data);
      if (!result.ok) {
        return res.status(result.code).json({ ok: false, error: result.error });
      }
      return res.status(201).json({ ok: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao criar agendamento' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { status, from, to } = req.query;
      if (env.MOCK_MODE) {
        let data = [...mockStore.appointments];
        if (status) data = data.filter((a) => a.status === status);
        if (from) {
          const f = startOfDay(parseISO(from as string));
          data = data.filter((a) => {
            const s = mockStore.schedules.find((x) => x.id === a.scheduleId);
            return s && s.date >= f;
          });
        }
        if (to) {
          const t = startOfDay(parseISO(to as string));
          data = data.filter((a) => {
            const s = mockStore.schedules.find((x) => x.id === a.scheduleId);
            return s && s.date <= t;
          });
        }
        const joined = data.map((a) => ({
          ...a,
          student: mockStore.students.find((s) => s.id === a.studentId) ?? null,
          schedule: mockStore.schedules.find((s) => s.id === a.scheduleId) ?? null,
          class: mockStore.classes.find((c) => c.id === a.classId) ?? null,
        }));
        return res.json({ ok: true, data: joined });
      }
      const data = await AppointmentsService.list({
        status: status as string | undefined,
        from: from as string | undefined,
        to: to as string | undefined,
      });
      return res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao listar agendamentos' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ ok: false, error: 'ID invalido' });
      }
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: 'Status invalido', details: parsed.error.flatten().fieldErrors });
      }
      if (env.MOCK_MODE) {
        const idx = mockStore.appointments.findIndex((a) => a.id === id);
        if (idx === -1) return res.status(404).json({ ok: false, error: 'Agendamento nao encontrado' });
        const prev = mockStore.appointments[idx].status;
        mockStore.appointments[idx].status = parsed.data.status;
        if (parsed.data.status === 'cancelled' && prev !== 'cancelled') {
          const s = mockStore.schedules.find((s) => s.id === mockStore.appointments[idx].scheduleId);
          if (s && s.bookedCount > 0) s.bookedCount -= 1;
        }
        return res.json({ ok: true, data: mockStore.appointments[idx] });
      }
      const result = await AppointmentsService.updateStatus(id, parsed.data.status);
      if (!result.ok) {
        return res.status(result.code).json({ ok: false, error: result.error });
      }
      return res.json({ ok: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao atualizar status' });
    }
  }
}
