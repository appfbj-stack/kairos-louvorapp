/**
 * auth.ts — Middleware de autenticação JWT.
 *
 * Extrai o token do header Authorization (Bearer) ou query (?token=)
 * e popula req.user e req.tenantId.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  let token: string | undefined;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    req.tenantId = decoded.tenantId;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }
}

/** Auth opcional — se tiver token válido, popula req.user; senão segue anônimo. */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], env.JWT_SECRET) as AuthPayload;
      req.user = decoded;
      req.tenantId = decoded.tenantId;
    } catch {
      // segue sem autenticação
    }
  }
  next();
}
