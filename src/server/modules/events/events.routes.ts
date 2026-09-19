/**
 * events.routes.ts
 *
 * CRUD de eventos (escala) — escopado por tenant.
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ── GET /api/events ───────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to, type, page = 1, limit = 100 } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {
      tenantId: req.tenantId,
      deletedAt: null,
    };
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, string>).gte = from;
      if (to) (where.date as Record<string, string>).lte = to;
    }
    if (type) where.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        skip,
        take: Number(limit),
      }),
      prisma.event.count({ where }),
    ]);
    return res.json({ success: true, data, total, page: Number(page), limit: Number(limit) });
  }),
);

// ── POST /api/events ──────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, type, date, time, location, observations, scale } = req.body || {};
    if (!title || !type || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        error: 'title, type, date, time e location são obrigatórios',
      });
    }
    const event = await prisma.event.create({
      data: {
        tenantId: req.tenantId!,
        title,
        type,
        date,
        time,
        location,
        observations: observations || null,
        scale: scale || [],
      },
    });
    return res.status(201).json({ success: true, data: event });
  }),
);

// ── GET /api/events/:id ───────────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!event) {
      return res.status(404).json({ success: false, error: 'Evento não encontrado' });
    }
    return res.json({ success: true, data: event });
  }),
);

// ── PATCH /api/events/:id ─────────────────────────────────────
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const allowed = ['title', 'type', 'date', 'time', 'location', 'observations', 'scale'];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) data[k] = req.body[k];
    }
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Evento não encontrado' });
    }
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data,
    });
    return res.json({ success: true, data: updated });
  }),
);

// ── DELETE /api/events/:id ────────────────────────────────────
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Evento não encontrado' });
    }
    await prisma.event.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    return res.json({ success: true, message: 'Evento removido' });
  }),
);

export default router;
