import { Request, Response } from 'express';
import { env } from '../../config/env';
import { mockStore } from '../../mock/store';
import { StudentsService } from './students.service';

export class StudentsController {
  static async list(req: Request, res: Response) {
    try {
      if (env.MOCK_MODE) {
        return res.json({ ok: true, data: mockStore.students });
      }
      const data = await StudentsService.list();
      return res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao listar alunos' });
    }
  }

  static async findByPhone(req: Request, res: Response) {
    try {
      const phone = req.query.phone as string;
      if (!phone) return res.status(400).json({ ok: false, error: 'Telefone obrigatorio' });
      if (env.MOCK_MODE) {
        const clean = phone.replace(/\D/g, '');
        const student = mockStore.students.find((s) => s.phone.replace(/\D/g, '') === clean);
        if (!student) return res.status(404).json({ ok: false, error: 'Aluno nao encontrado' });
        return res.json({ ok: true, data: student });
      }
      const student = await StudentsService.findByPhone(phone);
      if (!student) return res.status(404).json({ ok: false, error: 'Aluno nao encontrado' });
      return res.json({ ok: true, data: student });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'Erro ao buscar aluno' });
    }
  }
}
