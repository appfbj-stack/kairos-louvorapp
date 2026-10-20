/**
 * members.routes.ts — CRUD de membros da equipe do tenant.
 *
 * Rotas:
 *   - GET    /api/members        → lista
 *   - POST   /api/members        → cria (só líder)
 *   - GET    /api/members/:id    → detalhe
 *   - PATCH  /api/members/:id    → atualiza (só líder)
 *   - DELETE /api/members/:id    → soft delete (só líder)
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { Role } from '../../../generated/prisma/client';

const router = Router();

const isLeader = (req: Request): boolean =>
  req.user!.role === Role.LEADER || req.user!.role === Role.SUPER_ADMIN;

const forbidden = (res: Response) =>
  res.status(403).json({ success: false, error: 'Apenas o líder pode gerenciar membros' });

// ── GET /api/members ─────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const where: Record<string, unknown> = { tenantId: req.tenantId, deletedAt: null };
    if (req.query?.funcao) where.function = String(req.query.funcao);
    if (req.query?.role) where.role = String(req.query.role);

    const data = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        function: true,
        instrument: true,
        phone: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    return res.json({ success: true, data, total: data.length });
  }),
);

// ── POST /api/members ────────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isLeader(req)) return forbidden(res);

    const { name, email, password, role, function: funcao, instrument, phone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email e password são obrigatórios' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, error: 'A senha precisa ter ao menos 6 caracteres' });
    }

    const existing = await prisma.user.findFirst({
      where: { tenantId: req.tenantId, email },
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Já existe um membro com esse e-mail' });
    }

    const member = await prisma.user.create({
      data: {
        tenantId: req.tenantId!,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash: await bcrypt.hash(String(password), 12),
        role: [Role.LEADER, Role.MEMBER].includes(role) ? role : Role.MEMBER,
        function: funcao ? String(funcao) : 'Voz',
        instrument: instrument ? String(instrument) : null,
        phone: phone ? String(phone) : null,
      },
      select: { id: true, name: true, email: true, role: true, function: true, instrument: true, phone: true, active: true, createdAt: true },
    });
    return res.status(201).json({ success: true, data: member });
  }),
);

// ── GET /api/members/:id ─────────────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const member = await prisma.user.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
      select: {
        id: true, name: true, email: true, role: true, function: true,
        instrument: true, phone: true, active: true, lastLoginAt: true, createdAt: true,
      },
    });
    if (!member) return res.status(404).json({ success: false, error: 'Membro não encontrado' });
    return res.json({ success: true, data: member });
  }),
);

// ── PATCH /api/members/:id ───────────────────────────────────────
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isLeader(req)) return forbidden(res);

    const existing = await prisma.user.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Membro não encontrado' });

    const allowed = ['name', 'email', 'role', 'function', 'instrument', 'phone', 'active', 'password'];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) data[k] = req.body[k];
    }
    if (data.password) {
      if (String(data.password).length < 6) {
        return res.status(400).json({ success: false, error: 'A senha precisa ter ao menos 6 caracteres' });
      }
      data.passwordHash = await bcrypt.hash(String(data.password), 12);
      delete data.password;
    }
    if (typeof data.email === 'string') data.email = data.email.trim().toLowerCase();
    if (data.role && ![Role.LEADER, Role.MEMBER].includes(data.role)) delete data.role;
    // Não deixa remover o próprio acesso de líder de si mesmo
    if (existing.id === req.user!.userId && (data.role || data.active === false)) {
      return res.status(400).json({ success: false, error: 'Você não pode remover seu próprio acesso de líder' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, function: true, instrument: true, phone: true, active: true, updatedAt: true },
    });
    return res.json({ success: true, data: updated });
  }),
);

// ── DELETE /api/members/:id ──────────────────────────────────────
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isLeader(req)) return forbidden(res);
    if (req.params.id === req.user!.userId) {
      return res.status(400).json({ success: false, error: 'Você não pode remover a si mesmo' });
    }

    const existing = await prisma.user.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Membro não encontrado' });

    await prisma.user.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), active: false } });
    return res.json({ success: true, message: 'Membro removido' });
  }),
);

export default router;