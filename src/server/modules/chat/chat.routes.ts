/**
 * chat.routes.ts
 *
 * Mensagens da equipe — escopado por tenant.
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ── GET /api/chat ─────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { since, limit = 200 } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId };
    if (since) where.createdAt = { gt: new Date(since) };

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: Number(limit),
    });
    return res.json({ success: true, data: messages, total: messages.length });
  }),
);

// ── POST /api/chat ────────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, error: 'content é obrigatório' });
    }
    const msg = await prisma.chatMessage.create({
      data: {
        tenantId: req.tenantId!,
        senderId: req.user!.userId,
        senderName: req.user!.name,
        senderRole: req.user!.role,
        content: String(content).trim(),
      },
    });
    return res.status(201).json({ success: true, data: msg });
  }),
);

// ── DELETE /api/chat/:id (apenas o próprio autor ou LEADER) ───
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const msg = await prisma.chatMessage.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId },
    });
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Mensagem não encontrada' });
    }
    const isOwner = msg.senderId === req.user!.userId;
    const isLeader = req.user!.role === 'LEADER';
    if (!isOwner && !isLeader) {
      return res
        .status(403)
        .json({ success: false, error: 'Sem permissão para remover esta mensagem' });
    }
    await prisma.chatMessage.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Mensagem removida' });
  }),
);

export default router;
