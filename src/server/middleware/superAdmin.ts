/**
 * superAdmin.ts — Middleware de autorização para rotas /api/super-admin/*.
 *
 * Só passa usuários com role SUPER_ADMIN (escopo global).
 */

import { Request, Response, NextFunction } from 'express';

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Acesso restrito ao Super Admin da plataforma',
    });
  }
  next();
}
