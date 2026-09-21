import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = {
  sub: number;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'eva-atelie-auth',
    }) as unknown as JwtPayload;
    if (!decoded || typeof decoded.sub !== 'number') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Token nao fornecido' });
  }

  const token = header.slice(7);
  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ ok: false, error: 'Token invalido ou expirado' });
  }

  (req as any).user = decoded;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as JwtPayload | undefined;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Nao autorizado' });
  }
  if (user.role !== 'admin' && user.role !== 'super') {
    return res.status(403).json({ ok: false, error: 'Permissao negada' });
  }
  next();
}
