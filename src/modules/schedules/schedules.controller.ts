import { Request, Response } from 'express';
import { env } from '../../config/env';
import { mockStore } from '../../mock/store';
import { SchedulesService, scheduleCreateSchema, scheduleUpdateSchema } from './schedules.service';
import { formatISO, parseISO, startOfDay } from 'date-fns';

export class SchedulesController {
  static async listAvailable(req: Request, res: Response) {
    try {
      const { from, to, classId } = req.query;
      if (env.MOCK_MODE) {
        let data = mockStore.schedules.filter((s) => s.active);
        if (classId) data = data.filter((s) => s.classId === Number(classId));
        if (from) {
          const f = startOfDay(parseISO(from as string));
          data = data.filter((s) => s.date >= f);
        }
        if (to) {
          const t = startOfDay(parseISO(to as string));
          data = data.filter((s) => s.date <= t);
        }
        return res.json({ ok: true, data });
      }
      const result = await SchedulesService.listAvailable({
        from: from as string | undefined,
        to: to as string | undefined,
        classId: classId ? Number(classId) : undefined,
      });
      return res.json({ ok: true, data: result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao listar horarios' });
    }
  }

  static async listAll(req: Request, res: Response) {
    try {
      if (env.MOCK_MODE) {
        return res.json({ ok: true, data: mockStore.schedules });
      }
      const data = await SchedulesService.listAll();
      return res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao listar horarios' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const parsed = scheduleCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors });
      }
      if (env.MOCK_MODE) {
        const created = {
          id: mockStore.nextScheduleId(),
          classId: parsed.data.classId,
          date: startOfDay(parseISO(parsed.data.date)),
          startTime: parsed.data.startTime,
          endTime: parsed.data.endTime,
          capacity: parsed.data.capacity,
          bookedCount: 0,
          active: true,
          createdAt: new Date(),
        };
        mockStore.schedules.push(created);
        return res.status(201).json({ ok: true, data: created });
      }
      const result = await SchedulesService.create(parsed.data);
      if (!result.ok) {
        return res.status(result.code).json({ ok: false, error: result.error });
      }
      return res.status(201).json({ ok: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao criar horario' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ ok: false, error: 'ID invalido' });
      }
      const parsed = scheduleUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors });
      }
      if (env.MOCK_MODE) {
        const idx = mockStore.schedules.findIndex((s) => s.id === id);
        if (idx === -1) return res.status(404).json({ ok: false, error: 'Horario nao encontrado' });
        const updated: any = { ...mockStore.schedules[idx], ...parsed.data };
        if (typeof updated.date === 'string') updated.date = startOfDay(parseISO(parsed.data.date as string));
        mockStore.schedules[idx] = updated;
        return res.json({ ok: true, data: updated });
      }
      const result = await SchedulesService.update(id, parsed.data);
      if (!result.ok) {
        return res.status(result.code).json({ ok: false, error: result.error });
      }
      return res.json({ ok: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao atualizar horario' });
    }
  }
}
