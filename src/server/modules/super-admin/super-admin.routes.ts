/**
 * super-admin.routes.ts
 *
 * Painel Super Admin da plataforma.
 * TODAS as rotas exigem role SUPER_ADMIN.
 *
 * Rotas:
 *  - GET    /api/super-admin/stats            → indicadores do dashboard
 *  - GET    /api/super-admin/tenants          → lista todas as igrejas
 *  - POST   /api/super-admin/tenants          → cria igreja + admin inicial
 *  - GET    /api/super-admin/tenants/:id      → detalhes completos
 *  - PATCH  /api/super-admin/tenants/:id      → edita dados básicos
 *  - DELETE /api/super-admin/tenants/:id      → soft delete
 *  - POST   /api/super-admin/tenants/:id/block     → bloqueia com motivo
 *  - POST   /api/super-admin/tenants/:id/unblock   → desbloqueia (30 dias)
 *  - POST   /api/super-admin/tenants/:id/trial     → reseta trial p/ 10 dias
 *  - GET    /api/super-admin/tenants/:id/stats     → contadores
 *  - GET    /api/super-admin/audit               → audit log
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';
import { requireSuperAdmin } from '../../middleware/superAdmin';

const router = Router();
router.use(authMiddleware, requireSuperAdmin);

// ── GET /api/super-admin/stats ────────────────────────────────
router.get(
  '/stats',
  asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [total, trial, active, blocked, cancelled, expiring, users, songs, events] =
      await Promise.all([
        prisma.tenant.count({ where: { deletedAt: null } }),
        prisma.tenant.count({
          where: { deletedAt: null, subscriptionStatus: 'TRIAL' },
        }),
        prisma.tenant.count({
          where: { deletedAt: null, subscriptionStatus: 'ACTIVE' },
        }),
        prisma.tenant.count({
          where: { deletedAt: null, subscriptionStatus: 'BLOCKED' },
        }),
        prisma.tenant.count({
          where: { deletedAt: null, subscriptionStatus: 'CANCELLED' },
        }),
        prisma.tenant.count({
          where: {
            deletedAt: null,
            subscriptionStatus: 'ACTIVE',
            subscriptionEndsAt: { gte: now, lte: in7days },
          },
        }),
        prisma.user.count({ where: { deletedAt: null, role: { not: 'SUPER_ADMIN' } } }),
        prisma.song.count({ where: { deletedAt: null } }),
        prisma.event.count({ where: { deletedAt: null } }),
      ]);

    return res.json({
      success: true,
      data: {
        total,
        trial,
        active,
        blocked,
        cancelled,
        expiringIn7Days: expiring,
        totalUsers: users,
        totalSongs: songs,
        totalEvents: events,
      },
    });
  }),
);

// ── GET /api/super-admin/tenants ──────────────────────────────
router.get(
  '/tenants',
  asyncHandler(async (req: Request, res: Response) => {
    const { search, status, page = 1, limit = 50 } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.subscriptionStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          _count: { select: { users: true, songs: true, events: true, notices: true } },
        },
      }),
      prisma.tenant.count({ where }),
    ]);
    return res.json({ success: true, data, total, page: Number(page), limit: Number(limit) });
  }),
);

// ── POST /api/super-admin/tenants ─────────────────────────────
router.post(
  '/tenants',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, adminName, adminEmail, adminPassword } = req.body || {};

    if (!name || !slug || !adminName || !adminEmail) {
      return res
        .status(400)
        .json({ success: false, error: 'name, slug, adminName e adminEmail são obrigatórios' });
    }
    const slugLower = String(slug).toLowerCase().trim();
    const existing = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'slug já existe' });
    }

    // Senha aleatória se não informada
    const finalPassword =
      adminPassword ||
      Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase();
    const passwordHash = await bcrypt.hash(finalPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: String(name).trim(),
          slug: slugLower,
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
      });
      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: String(adminName).trim(),
          email: String(adminEmail).toLowerCase().trim(),
          passwordHash,
          role: 'LEADER',
          function: 'Líder de Louvor',
        },
      });
      await tx.auditLog.create({
        data: {
          superAdminId: req.user!.userId,
          superAdminEmail: req.user!.email,
          action: 'CREATE_TENANT',
          targetId: tenant.id,
          details: { tenantName: tenant.name, tenantSlug: tenant.slug, adminEmail: admin.email },
        },
      });
      return { tenant, admin, generatedPassword: finalPassword };
    });

    return res.status(201).json({
      success: true,
      tenant: result.tenant,
      admin: { id: result.admin.id, name: result.admin.name, email: result.admin.email },
      generatedPassword: result.generatedPassword,
    });
  }),
);

// ── GET /api/super-admin/tenants/:id ──────────────────────────
router.get(
  '/tenants/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const tenant = await prisma.tenant.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            function: true,
            active: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        _count: { select: { songs: true, events: true, notices: true, messages: true } },
      },
    });
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Igreja não encontrada' });
    }
    return res.json({ success: true, data: tenant });
  }),
);

// ── PATCH /api/super-admin/tenants/:id ─────────────────────────
router.patch(
  '/tenants/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const allowed = ['name', 'subscriptionEndsAt', 'trialEndsAt', 'active', 'logo'];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) data[k] = req.body[k];
    }
    if (data.subscriptionEndsAt) data.subscriptionEndsAt = new Date(data.subscriptionEndsAt as string);
    if (data.trialEndsAt) data.trialEndsAt = new Date(data.trialEndsAt as string);

    const updated = await prisma.tenant.update({ where: { id: req.params.id }, data });
    return res.json({ success: true, data: updated });
  }),
);

// ── POST /api/super-admin/tenants/:id/block ──────────────────
router.post(
  '/tenants/:id/block',
  asyncHandler(async (req: Request, res: Response) => {
    const { motivo } = req.body || {};
    const updated = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        subscriptionStatus: 'BLOCKED',
        motivoBloqueio: motivo || 'Bloqueado pelo Super Admin',
        bloqueadoEm: new Date(),
        bloqueadoPor: req.user!.userId,
      },
    });
    await prisma.auditLog.create({
      data: {
        superAdminId: req.user!.userId,
        superAdminEmail: req.user!.email,
        action: 'BLOCK_TENANT',
        targetId: updated.id,
        details: { motivo: motivo || 'Bloqueado pelo Super Admin' },
      },
    });
    return res.json({ success: true, data: updated, message: 'Igreja bloqueada' });
  }),
);

// ── POST /api/super-admin/tenants/:id/unblock ────────────────
router.post(
  '/tenants/:id/unblock',
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        subscriptionStatus: 'ACTIVE',
        motivoBloqueio: null,
        bloqueadoEm: null,
        bloqueadoPor: null,
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.auditLog.create({
      data: {
        superAdminId: req.user!.userId,
        superAdminEmail: req.user!.email,
        action: 'UNBLOCK_TENANT',
        targetId: updated.id,
      },
    });
    return res.json({
      success: true,
      data: updated,
      message: 'Igreja desbloqueada (30 dias)',
    });
  }),
);

// ── POST /api/super-admin/tenants/:id/trial ───────────────────
router.post(
  '/tenants/:id/trial',
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        subscriptionStatus: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        motivoBloqueio: null,
        bloqueadoEm: null,
        bloqueadoPor: null,
      },
    });
    await prisma.auditLog.create({
      data: {
        superAdminId: req.user!.userId,
        superAdminEmail: req.user!.email,
        action: 'RESET_TRIAL',
        targetId: updated.id,
      },
    });
    return res.json({ success: true, data: updated, message: 'Trial resetado (10 dias)' });
  }),
);

// ── DELETE /api/super-admin/tenants/:id ───────────────────────
router.delete(
  '/tenants/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.tenant.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), active: false },
    });
    await prisma.auditLog.create({
      data: {
        superAdminId: req.user!.userId,
        superAdminEmail: req.user!.email,
        action: 'DELETE_TENANT',
        targetId: req.params.id,
      },
    });
    return res.json({ success: true, message: 'Igreja removida (soft delete)' });
  }),
);

// ── GET /api/super-admin/audit ────────────────────────────────
router.get(
  '/audit',
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = 100 } = req.query as Record<string, string>;
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });
    return res.json({ success: true, data: logs, total: logs.length });
  }),
);

export default router;
