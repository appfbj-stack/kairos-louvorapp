/**
 * ai.routes.ts — Rotas de IA do tenant.
 *
 *   POST /api/ai/chat             → Kairós (assistente com ferramentas)
 *   GET  /api/ai/tools            → catálogo de ferramentas
 *   POST /api/ai/reflection       → reflexão espiritual a partir do repertório
 *   POST /api/ai/transpose        → transpõe letra ChordPro
 *   POST /api/ai/format-lyrics    → organiza letra bagunçada
 *   POST /api/ai/refine-notice    → refina aviso do mural
 *
 * Todas autenticadas e escopadas no tenant do JWT.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { minimaxText } from '../../services/minimax.client';
import { runKairos } from './kairos.agent';
import { toolCatalog } from './kairos.tools';

const router = Router();

const ctxFrom = (req: Request) => ({
  tenantId: req.tenantId!,
  userId: req.user!.userId,
  userName: req.user!.name,
  role: req.user!.role,
});

// ── POST /api/ai/chat ────────────────────────────────────────────
router.post(
  '/chat',
  asyncHandler(async (req: Request, res: Response) => {
    const message = (req.body?.message ?? '').toString().trim();
    if (!message) {
      return res.status(400).json({ success: false, error: 'Informe a mensagem' });
    }
    if (message.length > 4000) {
      return res.status(400).json({ success: false, error: 'Mensagem muito longa (máx 4000 caracteres)' });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-10).map((h: any) => ({
          role: h?.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: String(h?.content ?? '').slice(0, 4000),
        }))
      : [];

    const result = await runKairos({ message, ctx: ctxFrom(req), history });
    return res.json({
      success: true,
      data: { reply: result.reply, toolsUsed: result.toolsUsed, iterations: result.iterations },
    });
  }),
);

// ── GET /api/ai/tools ────────────────────────────────────────────
router.get('/tools', (_req: Request, res: Response) => {
  return res.json({ success: true, data: toolCatalog() });
});

// ── POST /api/ai/reflection ──────────────────────────────────────
router.post(
  '/reflection',
  asyncHandler(async (req: Request, res: Response) => {
    const songs = (req.body?.songs ?? []).filter((s: unknown) => typeof s === 'string');
    if (!songs.length) {
      return res.status(400).json({ success: false, error: 'Informe as músicas do culto' });
    }

    const text = await minimaxText({
      system:
        'Você é um líder de louvor devocional. Escreve reflexões curtas (máx 130 palavras), ternas e sem clichê, que conectem as músicas ao momento do culto.',
      user: `Músicas deste culto: ${songs.join(', ')}. Escreva uma reflexão para abrir a reunião da equipe antes do culto.`,
      temperature: 0.7,
      maxTokens: 400,
    });
    return res.json({ success: true, data: { reflection: text } });
  }),
);

// ── POST /api/ai/transpose ───────────────────────────────────────
router.post(
  '/transpose',
  asyncHandler(async (req: Request, res: Response) => {
    const { lyrics, fromKey, toKey } = req.body || {};
    if (!lyrics || !fromKey || !toKey) {
      return res.status(400).json({ success: false, error: 'lyrics, fromKey e toKey são obrigatórios' });
    }
    if (String(fromKey) === String(toKey)) {
      return res.json({ success: true, data: { lyrics, unchanged: true } });
    }

    const text = await minimaxText({
      system: `Você é um músico especialista em ChordPro. Você transpõe cifras preservando o formato original.
REGRAS:
- Mantenha a letra EXATAMENTE como está. Só os acordes mudam.
- Os acordes estão entre colchetes na sílaba correta: "[C]Te amo Deus, [G]Tua graça nunca falha".
- Transponha cada acorde proporcionalmente de ${fromKey} para ${toKey}, respeitando o círculo das quintas e a função harmônica (I, IV, V, vi, ii, iii, V7).
- Preserve marcadores de seção como [Intro], [Verso 1], [Refrão], [Ponte], [Final].
- Não acrescente explicação. Devolva SÓ a cifra transposta.`,
      user: `Tom atual: ${fromKey}\nTom novo: ${toKey}\n\nCifra original:\n${lyrics}`,
      temperature: 0.1,
      maxTokens: 3000,
    });
    return res.json({ success: true, data: { lyrics: text } });
  }),
);

// ── POST /api/ai/format-lyrics ───────────────────────────────────
router.post(
  '/format-lyrics',
  asyncHandler(async (req: Request, res: Response) => {
    const raw = req.body?.lyrics;
    if (!raw) {
      return res.status(400).json({ success: false, error: 'Informe a letra' });
    }

    const text = await minimaxText({
      system: `Você organiza letras de música para leitura em celular.
REGRAS:
- Identifique e rotule as seções: [Intro], [Verso 1], [Refrão], [Ponte], [Final].
- Remova ruído de WhatsApp (números de phone, "gravação", timestamps, "manda aí").
- Mantenha a letra intacta. Devolva SÓ a letra formatada, sem comentário.`,
      user: String(raw),
      temperature: 0.2,
      maxTokens: 3000,
    });
    return res.json({ success: true, data: { lyrics: text } });
  }),
);

// ── POST /api/ai/refine-notice ───────────────────────────────────
router.post(
  '/refine-notice',
  asyncHandler(async (req: Request, res: Response) => {
    const content = req.body?.content;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Informe o conteúdo do aviso' });
    }

    const text = await minimaxText({
      system: `Você é assistente de comunicação para ministérios de louvor.
Refine o aviso para ficar claro, organizado e encorajador para o time.
Preserve SEMPRE datas, horários, locais e nomes. Não invente informação nova.
Devolva SÓ o texto do aviso, sem título e sem comentário.`,
      user: String(content),
      temperature: 0.5,
      maxTokens: 800,
    });
    return res.json({ success: true, data: { content: text } });
  }),
);

export default router;