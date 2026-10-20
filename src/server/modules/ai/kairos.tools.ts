/**
 * kairos.tools.ts — Ferramentas do Kairós, assistente do ministério de louvor.
 *
 * Cada tool tem duas partes:
 *   1. definition  — o schema que o MiniMax vê pra decidir quando chamar
 *   2. execute     — a ação real no banco, sempre escopada por tenantId
 *
 * Regra de permissão: leitura é liberada pra qualquer membro do tenant.
 * Escrita (criar/alterar) exige role LEADER ou SUPER_ADMIN.
 */

import { prisma } from '../../config/database';
import { Role } from '../../../generated/prisma/client';
import type { MiniMaxTool } from '../../services/minimax.client';

export interface ToolContext {
  tenantId: string;
  userId: string;
  userName: string;
  role: Role;
}

export interface ToolDefinition extends MiniMaxTool {
  /** Escrita exige líder — se true, membro comum recebe bloqueio. */
  write: boolean;
  execute: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
}

const canWrite = (ctx: ToolContext): boolean =>
  ctx.role === Role.LEADER || ctx.role === Role.SUPER_ADMIN;

const denied = (tool: string) => ({
  ok: false,
  erro: `Somente o líder do ministério pode usar a ferramenta "${tool}".`,
});

const asString = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v.trim() : fallback;

const asInt = (v: unknown, fallback: number): number => {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
};

// ============================================================
// FERRAMENTAS DE LEITURA
// ============================================================

const listar_musicas: ToolDefinition = {
  type: 'function',
  write: false,
  function: {
    name: 'listar_musicas',
    description:
      'Lista as músicas do repertório do ministério. Use para responder sobre o que há no repertório, contar músicas, filtrar por tom ou buscar por tema/título.',
    parameters: {
      type: 'object',
      properties: {
        busca: { type: 'string', description: 'Termo de busca em título ou artista' },
        tom: { type: 'string', description: 'Filtra pela tonalidade (ex: C, G, Am, F#m)' },
        limite: { type: 'integer', description: 'Máximo de resultados (padrão 20, máx 50)' },
      },
      required: [],
    },
  },
  execute: async (args, ctx) => {
    const where: Record<string, unknown> = { tenantId: ctx.tenantId, deletedAt: null };
    const busca = asString(args.busca);
    const tom = asString(args.tom);
    if (busca) {
      where.OR = [
        { title: { contains: busca, mode: 'insensitive' } },
        { artist: { contains: busca, mode: 'insensitive' } },
      ];
    }
    if (tom) where.key = tom;

    const limite = Math.min(asInt(args.limite, 20), 50);
    const [rows, total] = await Promise.all([
      prisma.song.findMany({
        where,
        orderBy: { title: 'asc' },
        take: limite,
        select: { id: true, title: true, artist: true, key: true, updatedAt: true },
      }),
      prisma.song.count({ where: { tenantId: ctx.tenantId, deletedAt: null } }),
    ]);

    return {
      total_no_repertorio: total,
      retornadas: rows.length,
      musicas: rows,
    };
  },
};

const buscar_musica: ToolDefinition = {
  type: 'function',
  write: false,
  function: {
    name: 'buscar_musica',
    description:
      'Traz o detalhe de UMA música: letra ChordPro completa, tom e arranjo. Use SEMPRE que o usuário pedir a cifra, a letra ou o arranjo de uma música específica.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título (ou trecho) da música' },
      },
      required: ['titulo'],
    },
  },
  execute: async (args, ctx) => {
    const titulo = asString(args.titulo);
    if (!titulo) return { ok: false, erro: 'Informe o título da música.' };

    const songs = await prisma.song.findMany({
      where: {
        tenantId: ctx.tenantId,
        deletedAt: null,
        OR: [
          { title: { contains: titulo, mode: 'insensitive' } },
          { artist: { contains: titulo, mode: 'insensitive' } },
        ],
      },
      take: 3,
      orderBy: { title: 'asc' },
    });

    if (songs.length === 0) {
      return {
        ok: false,
        erro: `Nenhuma música chamada "${titulo}" no repertório. Não invente a cifra — sugira cadastrar no repertório.`,
      };
    }

    return {
      encontradas: songs.length,
      musicas: songs.map((s) => ({
        id: s.id,
        titulo: s.title,
        artista: s.artist,
        tom: s.key,
        letra_chordpro: s.lyrics,
        arranjo: s.arrangement,
        youtube: s.youtubeUrl,
        audio: s.audioUrl,
        drive: s.driveUrl,
      })),
      aviso: songs.length > 1 ? 'Há mais de um resultado — confirme com o usuário qual é o correcto.' : undefined,
    };
  },
};

const listar_eventos: ToolDefinition = {
  type: 'function',
  write: false,
  function: {
    name: 'listar_eventos',
    description:
      'Lista a agenda do ministério (cultos, ensaios, eventos especiais) com data, hora, local e quem está na escala.',
    parameters: {
      type: 'object',
      properties: {
        de: { type: 'string', description: 'Data inicial (YYYY-MM-DD)' },
        ate: { type: 'string', description: 'Data final (YYYY-MM-DD)' },
        tipo: { type: 'string', enum: ['CULTO', 'ENSAIO', 'ESPECIAL'] },
        limite: { type: 'integer', description: 'Máximo de resultados (padrão 15)' },
      },
      required: [],
    },
  },
  execute: async (args, ctx) => {
    const where: Record<string, unknown> = { tenantId: ctx.tenantId, deletedAt: null };
    if (asString(args.de)) where.date = { gte: asString(args.de) };
    if (asString(args.ate)) {
      where.date = { ...((where.date as object) || {}), lte: asString(args.ate) };
    }
    if (asString(args.tipo)) where.type = asString(args.tipo);

    const rows = await prisma.event.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: Math.min(asInt(args.limite, 15), 40),
    });

    return {
      total: rows.length,
      eventos: rows.map((e) => ({
        id: e.id,
        titulo: e.title,
        tipo: e.type,
        data: e.date,
        hora: e.time,
        local: e.location,
        observacoes: e.observations,
        escala: e.scale,
      })),
    };
  },
};

const listar_avisos: ToolDefinition = {
  type: 'function',
  write: false,
  function: {
    name: 'listar_avisos',
    description: 'Lista os avisos do mural do ministério, do mais recente para o mais antigo.',
    parameters: {
      type: 'object',
      properties: {
        limite: { type: 'integer', description: 'Máximo de resultados (padrão 10)' },
      },
      required: [],
    },
  },
  execute: async (args, ctx) => {
    const rows = await prisma.notice.findMany({
      where: { tenantId: ctx.tenantId, deletedAt: null },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(asInt(args.limite, 10), 30),
      select: { id: true, title: true, content: true, isPinned: true, authorName: true, createdAt: true },
    });
    return { total: rows.length, avisos: rows };
  },
};

const listar_membros: ToolDefinition = {
  type: 'function',
  write: false,
  function: {
    name: 'listar_membros',
    description:
      'Lista os membros da equipe com função, papel (líder/membro), e-mail e telefone. Use para montar escala, conferir quem está disponível ou contar a equipe.',
    parameters: {
      type: 'object',
      properties: {
        funcao: { type: 'string', description: 'Filtra por função (ex: Voz, Violão, Teclado, Bateria)' },
      },
      required: [],
    },
  },
  execute: async (args, ctx) => {
    const where: Record<string, unknown> = { tenantId: ctx.tenantId, deletedAt: null };
    const funcao = asString(args.funcao);
    if (funcao) where.function = { contains: funcao, mode: 'insensitive' };

    const rows = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, function: true, instrument: true, phone: true, active: true },
    });

    return {
      total: rows.length,
      lideres: rows.filter((u) => u.role === Role.LEADER).length,
      membros: rows,
    };
  },
};

const resumo_do_ministerio: ToolDefinition = {
  type: 'function',
  write: false,
  function: {
    name: 'resumo_do_ministerio',
    description:
      'Um retrato geral do ministério: tamanho da equipe, total de músicas, próximo evento, avisos fixados e distribuição de funções. Use para "como está o(app)?", "me dá um resumo", ou antes de sugerir ações.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  execute: async (_args, ctx) => {
    const t = ctx.tenantId;
    const hoje = new Date().toISOString().slice(0, 10);

    const [usuarios, musicas, eventos, avisos, settings] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId: t, deletedAt: null },
        select: { name: true, role: true, function: true, active: true },
      }),
      prisma.song.findMany({
        where: { tenantId: t, deletedAt: null },
        select: { key: true },
      }),
      prisma.event.findMany({
        where: { tenantId: t, deletedAt: null, date: { gte: hoje } },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        take: 3,
      }),
      prisma.notice.findMany({
        where: { tenantId: t, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { title: true, isPinned: true, createdAt: true },
      }),
      prisma.ministrySettings.findUnique({ where: { tenantId: t } }),
    ]);

    const porFuncao: Record<string, number> = {};
    for (const u of usuarios) porFuncao[u.function] = (porFuncao[u.function] || 0) + 1;

    const porTom: Record<string, number> = {};
    for (const s of musicas) porTom[s.key] = (porTom[s.key] || 0) + 1;

    return {
      igreja: settings?.churchName ?? null,
      equipe: {
        total: usuarios.length,
        lideres: usuarios.filter((u) => u.role === Role.LEADER).length,
        inativos: usuarios.filter((u) => !u.active).length,
        por_funcao: porFuncao,
      },
      repertorio: { total: musicas.length, por_tom: porTom },
      proximos_eventos: eventos.map((e) => ({
        titulo: e.title,
        tipo: e.type,
        quando: `${e.date} às ${e.time}`,
        local: e.location,
        pessoas_na_escala: Array.isArray(e.scale) ? e.scale.length : 0,
      })),
      avisos_recentes: avisos,
    };
  },
};

// ============================================================
// FERRAMENTAS DE ESCRITA (somente líder)
// ============================================================

const criar_musica: ToolDefinition = {
  type: 'function',
  write: true,
  function: {
    name: 'criar_musica',
    description:
      'Cadastra uma música nova no repertório. A letra DEVE vir em formato ChordPro com os acordes entre colchetes na sílaba correta — ex: "[C]Te amo Deus, [G]Tua graça nunca falha". Chame só depois de confirmar com o usuário o título e o tom.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título da música' },
        artista: { type: 'string', description: 'Intérprete/origem' },
        tom: { type: 'string', description: 'Tonalidade oficial (ex: C, G, Am, F#m)' },
        letra_chordpro: { type: 'string', description: 'Letra com acordes em colchetes na sílaba certa. Use [Intro], [Verso 1], [Refrão], [Ponte], [Final] para marcar seções.' },
        arranjo: { type: 'string', description: 'Arranjo em markdown: ## Seção + - bullets com instruções' },
        youtube: { type: 'string', description: 'Link do YouTube (opcional)' },
      },
      required: ['titulo', 'artista', 'tom', 'letra_chordpro'],
    },
  },
  execute: async (args, ctx) => {
    if (!canWrite(ctx)) return denied('criar_musica');
    const titulo = asString(args.titulo);
    const letra = asString(args.letra_chordpro);
    if (!titulo || !letra) return { ok: false, erro: 'Título e letra são obrigatórios.' };

    const song = await prisma.song.create({
      data: {
        tenantId: ctx.tenantId,
        title: titulo,
        artist: asString(args.artista, '—'),
        key: asString(args.tom, 'C'),
        lyrics: letra,
        arrangement: asString(args.arranjo) || null,
        youtubeUrl: asString(args.youtube) || null,
      },
    });
    return { ok: true, mensagem: `Música "${song.title}" cadastrada no repertório.`, id: song.id, tom: song.key };
  },
};

const criar_evento: ToolDefinition = {
  type: 'function',
  write: true,
  function: {
    name: 'criar_evento',
    description:
      'Cria um evento na agenda. Chame só depois de confirmar com o usuário data, hora e local. Converta datas para o formato YYYY-MM-DD.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Nome do evento' },
        tipo: { type: 'string', enum: ['CULTO', 'ENSAIO', 'ESPECIAL'] },
        data: { type: 'string', description: 'Data no formato YYYY-MM-DD' },
        hora: { type: 'string', description: 'Hora no formato HH:MM' },
        local: { type: 'string', description: 'Local do evento' },
        observacoes: { type: 'string', description: 'Observações opcionais' },
      },
      required: ['titulo', 'tipo', 'data', 'hora', 'local'],
    },
  },
  execute: async (args, ctx) => {
      if (!canWrite(ctx)) return denied('criar_evento');
      const titulo = asString(args.titulo);
      const dataISO = asString(args.data);
      if (!titulo || !dataISO) return { ok: false, erro: 'Título e data são obrigatórios.' };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
        return { ok: false, erro: `Data inválida ("${dataISO}"). Use o formato YYYY-MM-DD.` };
      }

      const tipo = ['CULTO', 'ENSAIO', 'ESPECIAL'].includes(asString(args.tipo))
        ? (asString(args.tipo) as 'CULTO' | 'ENSAIO' | 'ESPECIAL')
        : 'CULTO';

      const ev = await prisma.event.create({
        data: {
          tenantId: ctx.tenantId,
          title: titulo,
          type: tipo,
          date: dataISO,
          time: asString(args.hora, '19:00'),
          location: asString(args.local, 'A definir'),
          observations: asString(args.observacoes) || null,
          scale: [],
        },
      });
      return { ok: true, mensagem: `"${ev.title}" (${ev.type}) criado para ${ev.date} às ${ev.time}.`, id: ev.id };
    },
};

const publicar_aviso: ToolDefinition = {
  type: 'function',
  write: true,
  function: {
    name: 'publicar_aviso',
    description:
      'Publica um aviso no mural do ministério. Escreva em linguagem clara, encorajadora e objetiva, preservando datas, horários e locais.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título curto do aviso' },
        conteudo: { type: 'string', description: 'Texto do aviso' },
        fixar: { type: 'boolean', description: 'Se verdadeiro, fixa no topo do mural' },
      },
      required: ['titulo', 'conteudo'],
    },
  },
  execute: async (args, ctx) => {
    if (!canWrite(ctx)) return denied('publicar_aviso');
    const titulo = asString(args.titulo);
    const conteudo = asString(args.conteudo);
    if (!titulo || !conteudo) return { ok: false, erro: 'Título e conteúdo são obrigatórios.' };

    const fixar = args.fixar === true;
    if (fixar) {
      await prisma.notice.updateMany({
        where: { tenantId: ctx.tenantId, deletedAt: null },
        data: { isPinned: false },
      });
    }

    const n = await prisma.notice.create({
      data: {
        tenantId: ctx.tenantId,
        title: titulo,
        content: conteudo,
        isPinned: fixar,
        authorId: ctx.userId,
        authorName: ctx.userName,
      },
    });
    return { ok: true, mensagem: `Aviso "${n.title}" publicado no mural.`, id: n.id };
  },
};

const transpor_musica: ToolDefinition = {
  type: 'function',
  write: true,
  function: {
    name: 'transpor_musica',
    description:
      'Transpõe uma música do repertório para outra tonalidade, reescrevendo os acordes da letra ChordPro e atualizando o tom oficial. Confirme SEMPRE a nova tonalidade com o usuário antes de gravar — isso altera a música para todos.',
    parameters: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título da música' },
        novo_tom: { type: 'string', description: 'Tonalidade destino (ex: G, Am, F#m)' },
      },
      required: ['titulo', 'novo_tom'],
    },
  },
  execute: async (args, ctx) => {
    if (!canWrite(ctx)) return denied('transpor_musica');
    const titulo = asString(args.titulo);
    const novoTom = asString(args.novo_tom);
    if (!titulo || !novoTom) return { ok: false, erro: 'Informe o título e o novo tom.' };

    const song = await prisma.song.findFirst({
      where: { tenantId: ctx.tenantId, deletedAt: null, title: { contains: titulo, mode: 'insensitive' } },
      orderBy: { title: 'asc' },
    });
    if (!song) return { ok: false, erro: `Música "${titulo}" não encontrada no repertório.` };

    // A transposição de acordes é feita pelo próprio modelo antes desta chamada
    // (a tool recebe a letra já reescrita em `letra_transposta`, quando presente).
    const letraNova = asString(args.letra_transposta) || song.lyrics;

    const updated = await prisma.song.update({
      where: { id: song.id },
      data: { key: novoTom, lyrics: letraNova },
    });
    return {
      ok: true,
      mensagem: `"${updated.title}" agora está em ${novoTom} (era ${song.key}).`,
      id: updated.id,
      tom_anterior: song.key,
      tom_atual: updated.key,
    };
  },
};

// ============================================================
// REGISTRO
// ============================================================

export const KAIROS_TOOLS: ToolDefinition[] = [
  listar_musicas,
  buscar_musica,
  listar_eventos,
  listar_avisos,
  listar_membros,
  resumo_do_ministerio,
  criar_musica,
  criar_evento,
  publicar_aviso,
  transpor_musica,
];

const byName = new Map(KAIROS_TOOLS.map((t) => [t.function.name, t]));

export function getTool(name: string): ToolDefinition | undefined {
  return byName.get(name);
}

/** Schemas no formato que a MiniMax espera (sem os metadados internos). */
export function toolSchemas(): MiniMaxTool[] {
  return KAIROS_TOOLS.map(({ type, function: fn }) => ({
    type,
    function: { name: fn.name, description: fn.description, parameters: fn.parameters },
  }));
}

/** Lista enxuta pro frontend mostrar "o que o Kairós sabe fazer". */
export function toolCatalog() {
  return KAIROS_TOOLS.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    write: t.write,
  }));
}