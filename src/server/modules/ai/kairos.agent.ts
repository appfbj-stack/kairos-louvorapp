/**
 * kairos.agent.ts — Loop de tool-calling do Kairós.
 *
 * Fluxo: pergunta do usuário → MiniMax decide as tools → a gente executa
 * contra o banco (escopado no tenant) → devolve o resultado das tools →
 * o MiniMax escreve a resposta final pro líder.
 */

import { minimaxChat, parseToolArgs, type MiniMaxMessage } from '../../services/minimax.client';
import { getTool, toolSchemas, type ToolContext } from './kairos.tools';

const SYSTEM_PROMPT = `Você é o Kairós, assistente do ministério de louvor. Você ajuda o líder e a equipe a cuidarem do culto: repertório, cifras, arranjos, escalas, avisos e organização.

COMO FALAR
- Português do Brasil, tom pastoral e direto. Sem enrolação, sem texto corporativo.
- Fale com a equipe por "você". Sem "prezado", sem "senhor".
- Respostas curtas por padrão. Só fica mais comprida quando o conteúdo pedir (ex: uma cifra inteira).

REGRAS IMPORTANTES
- SEMPRE consulte as ferramentas antes de afirmar qualquer dado do ministério. Nunca invente música, cifra, evento, membro ou aviso que você não tenha lido do banco.
- Se a música não existir no repertório, diga isso claramente e ofereça cadastrar.
- Não tem acesso à internet e não conhece cifras que não estejam no repertório. Não chute.
- Ao criar ou alterar algo (música, evento, aviso, transposição), confirme o detalhe com o usuário ANTES de executar a ferramenta. Depois de executar, confirme o que foi feito.
- Cifras são ChordPro: "[C]Te amo Deus, [G]Tua graça nunca falha" — o acorde vai na sílaba exata.
- Se o usuário for MEMBER (não líder), você pode consultar tudo, mas não criar nem alterar. Avise que precisa falar com o líder.`;

export interface KairosReply {
  reply: string;
  toolsUsed: Array<{ name: string; args: Record<string, unknown> }>;
  iterations: number;
}

export async function runKairos(opts: {
  message: string;
  ctx: ToolContext;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<KairosReply> {
  const messages: MiniMaxMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(opts.history ?? []).slice(-10).map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: opts.message },
  ];

  const toolsUsed: Array<{ name: string; args: Record<string, unknown> }> = [];
  const MAX_ITERATIONS = 6;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const res = await minimaxChat({
      messages,
      tools: toolSchemas(),
      toolChoice: 'auto',
      temperature: 0.3,
      maxTokens: 3000,
    });

    const msg = res.choices[0]?.message;
    const calls = msg?.tool_calls ?? [];

    if (!calls.length) {
      return {
        reply: (msg?.content ?? '').trim() || 'Não consegui montar uma resposta. Tenta escrever de outro jeito?',
        toolsUsed,
        iterations: i + 1,
      };
    }

    messages.push({ role: 'assistant', content: msg?.content ?? '', tool_calls: calls });

    for (const call of calls) {
      const name = call.function?.name ?? '';
      const args = parseToolArgs(call.function?.arguments ?? '{}');
      toolsUsed.push({ name, args });

      const def = getTool(name);
      let result: unknown;

      if (!def) {
        result = { ok: false, erro: `Ferramenta "${name}" não existe.` };
      } else if (def.write && opts.ctx.role !== 'LEADER' && opts.ctx.role !== 'SUPER_ADMIN') {
        result = { ok: false, erro: 'Apenas o líder do ministério pode criar ou alterar coisas.' };
      } else {
        try {
          result = await def.execute(args, opts.ctx);
        } catch (err: any) {
          result = { ok: false, erro: `Falha ao executar ${name}: ${err?.message ?? 'erro desconhecido'}` };
        }
      }

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        name,
        content: JSON.stringify(result),
      });
    }
  }

  // Estourou o loop — força resposta final sem tools.
  messages.push({
    role: 'user',
    content: 'Resuma agora o que você encontrou, sem chamar mais ferramentas.',
  });

  const final = await minimaxChat({ messages, temperature: 0.3, maxTokens: 1500 });
  return {
    reply: (final.choices[0]?.message.content ?? '').trim(),
    toolsUsed,
    iterations: MAX_ITERATIONS,
  };
}