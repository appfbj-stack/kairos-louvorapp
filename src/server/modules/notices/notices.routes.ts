/**
 * notices.routes.ts
 *
 * CRUD de avisos do Mural — escopado por tenant.
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ── GET /api/notices ──────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const data = await prisma.notice.findMany({
      where: { tenantId: req.tenantId, deletedAt: null },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
    return res.json({ success: true, data, total: data.length });
  }),
);

// ── POST /api/notices ─────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, content, isPinned } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'title e content são obrigatórios' });
    }
    const notice = await prisma.notice.create({
      data: {
        tenantId: req.tenantId!,
        title,
        content,
        isPinned: !!isPinned,
        authorId: req.user!.userId,
        authorName: req.user!.name,
      },
    });
    return res.status(201).json({ success: true, data: notice });
  }),
);

// ── PATCH /api/notices/:id ─────────────────────────────────────
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const allowed = ['title', 'content', 'isPinned'];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) data[k] = req.body[k];
    }
    // Apenas 1 pinado por vez
    if (data.isPinned === true) {
      await prisma.notice.updateMany({
        where: { tenantId: req.tenantId, isPinned: true, id: { not: req.params.id } },
        data: { isPinned: false },
      });
    }
    const existing = await prisma.notice.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Aviso não encontrado' });
    }
    const updated = await prisma.notice.update({ where: { id: req.params.id }, data });
    return res.json({ success: true, data: updated });
  }),
);

// ── DELETE /api/notices/:id ───────────────────────────────────
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.notice.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Aviso não encontrado' });
    }
    await prisma.notice.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    return res.json({ success: true, message: 'Aviso removido' });
  }),
);

export default router;
