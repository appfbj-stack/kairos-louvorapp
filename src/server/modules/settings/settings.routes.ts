/**
 * settings.routes.ts — Configurações do ministério (1 registro por tenant).
 *
 * Rotas:
 *   - GET /api/settings      → lê (cria com padrão se não existir)
 *   - PUT /api/settings      → atualiza (só líder)
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { Role } from '../../../generated/prisma/client';

const router = Router();

const isLeader = (req: Request): boolean =>
  req.user!.role === Role.LEADER || req.user!.role === Role.SUPER_ADMIN;

// ── GET /api/settings ────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.ministrySettings.findUnique({
      where: { tenantId: req.tenantId },
    });

    if (existing) return res.json({ success: true, data: existing });

    const created = await prisma.ministrySettings.create({
      data: { tenantId: req.tenantId! },
    });
    return res.json({ success: true, data: created });
  }),
);

// ── PUT /api/settings ────────────────────────────────────────────
router.put(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isLeader(req)) {
      return res.status(403).json({ success: false, error: 'Apenas o líder altera as configurações' });
    }

    const allowed = [
      'name', 'churchName', 'youtubeChannel', 'driveFolder', 'spotifyPlaylist',
      'instagram', 'allowMemberChat', 'allowMemberNotices',
      'confirmationDeadlineDays', 'enableVocalTraining', 'enableVideoLessons',
    ];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) data[k] = req.body[k];
    }
    if (data.confirmationDeadlineDays !== undefined) {
      const n = parseInt(String(data.confirmationDeadlineDays), 10);
      if (!Number.isFinite(n) || n < 1 || n > 30) {
        return res.status(400).json({ success: false, error: 'confirmationDeadlineDays deve estar entre 1 e 30' });
      }
      data.confirmationDeadlineDays = n;
    }

    const saved = await prisma.ministrySettings.upsert({
      where: { tenantId: req.tenantId! },
      create: { tenantId: req.tenantId!, ...data },
      update: data,
    });
    return res.json({ success: true, data: saved });
  }),
);

export default router;