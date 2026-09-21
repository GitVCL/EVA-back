import { Request, Response } from 'express';
import { env } from '../../config/env';
import { mockStore } from '../../mock/store';
import { ClassesService, classCreateSchema, classUpdateSchema } from './classes.service';

export class ClassesController {
  static async list(req: Request, res: Response) {
    try {
      if (env.MOCK_MODE) {
        const user = (req as any).user;
        const isAdmin = user?.role === 'admin' || user?.role === 'super';
        const data = isAdmin
          ? mockStore.classes
          : mockStore.classes.filter((c) => c.active);
        return res.json({ ok: true, data });
      }
      const user = (req as any).user;
      const isAdmin = user?.role === 'admin' || user?.role === 'super';
      const classes = await ClassesService.list({ onlyActive: !isAdmin });
      return res.json({ ok: true, data: classes });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao listar aulas' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const parsed = classCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors });
      }
      if (env.MOCK_MODE) {
        const raw = parsed.data as any;
        const created = {
          id: mockStore.nextClassId(),
          name: raw.name,
          description: raw.description ?? '',
          level: raw.level ?? 'Iniciante',
          durationMinutes: raw.durationMinutes ?? 60,
          maxCapacity: raw.maxCapacity ?? 6,
          priceCents: raw.priceCents ?? (raw.price ? Math.round(raw.price * 100) : 0),
          active: raw.active ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockStore.classes.push(created);
        return res.status(201).json({ ok: true, data: created });
      }
      const created = await ClassesService.create(parsed.data);
      return res.status(201).json({ ok: true, data: created });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao criar aula' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ ok: false, error: 'ID invalido' });
      }
      const parsed = classUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors });
      }
      if (env.MOCK_MODE) {
        const idx = mockStore.classes.findIndex((c) => c.id === id);
        if (idx === -1) return res.status(404).json({ ok: false, error: 'Aula nao encontrada' });
        const patched: any = { ...parsed.data };
        if (patched.description === null || patched.description === undefined) patched.description = mockStore.classes[idx].description;
        const updated = { ...mockStore.classes[idx], ...patched, updatedAt: new Date() };
        mockStore.classes[idx] = updated;
        return res.json({ ok: true, data: updated });
      }
      const updated = await ClassesService.update(id, parsed.data);
      return res.json({ ok: true, data: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao atualizar aula' });
    }
  }
}
