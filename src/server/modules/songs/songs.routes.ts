/**
 * songs.routes.ts
 *
 * CRUD de músicas (Repertório) — escopado por tenant.
 *
 * Rotas:
 *   - GET    /api/songs        → lista do tenant
 *   - POST   /api/songs        → cria
 *   - GET    /api/songs/:id    → detalhe
 *   - PATCH  /api/songs/:id    → atualiza
 *   - DELETE /api/songs/:id    → soft delete
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ── GET /api/songs ────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { search, key, page = 1, limit = 100 } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {
      tenantId: req.tenantId,
      deletedAt: null,
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (key) where.key = key;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      prisma.song.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.song.count({ where }),
    ]);
    return res.json({ success: true, data, total, page: Number(page), limit: Number(limit) });
  }),
);

// ── POST /api/songs ───────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, artist, key, lyrics, arrangement, youtubeUrl, driveUrl, audioUrl } = req.body || {};
    if (!title || !artist || !lyrics) {
      return res
        .status(400)
        .json({ success: false, error: 'title, artist e lyrics são obrigatórios' });
    }
    const song = await prisma.song.create({
      data: {
        tenantId: req.tenantId!,
        title,
        artist,
        key: key || 'C',
        lyrics,
        arrangement: arrangement || null,
        youtubeUrl: youtubeUrl || null,
        driveUrl: driveUrl || null,
        audioUrl: audioUrl || null,
      },
    });
    return res.status(201).json({ success: true, data: song });
  }),
);

// ── GET /api/songs/:id ─────────────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const song = await prisma.song.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!song) {
      return res.status(404).json({ success: false, error: 'Música não encontrada' });
    }
    return res.json({ success: true, data: song });
  }),
);

// ── PATCH /api/songs/:id ───────────────────────────────────────
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const allowed = ['title', 'artist', 'key', 'lyrics', 'arrangement', 'youtubeUrl', 'driveUrl', 'audioUrl'];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) data[k] = req.body[k];
    }
    // Garante escopo de tenant
    const existing = await prisma.song.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Música não encontrada' });
    }
    const updated = await prisma.song.update({
      where: { id: req.params.id },
      data,
    });
    return res.json({ success: true, data: updated });
  }),
);

// ── DELETE /api/songs/:id ──────────────────────────────────────
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.song.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Música não encontrada' });
    }
    await prisma.song.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    return res.json({ success: true, message: 'Música removida' });
  }),
);

export default router;
