/**
 * minimax.client.ts — Cliente da API MiniMax (formato OpenAI-compatible).
 *
 * Usado pelo Kairós (assistente do ministério) e pelas funções de IA
 * (transpor tom, formatar letra, refinar aviso, reflexão espiritual).
 *
 * A chave fica SÓ no backend — nunca é exposta ao bundle do navegador.
 */

import { env } from '../config/env';

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: MiniMaxToolCall[];
  name?: string;
}

export interface MiniMaxToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface MiniMaxTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface MiniMaxResponse {
  choices: Array<{
    finish_reason: string | null;
    message: MiniMaxMessage;
  }>;
  usage?: { total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
}

export class MiniMaxError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'MiniMaxError';
  }
}

function assertConfigured(): void {
  if (!env.MINIMAX_API_KEY) {
    throw new MiniMaxError('MINIMAX_API_KEY não configurada no servidor');
  }
}

/**
 * Chamada única de chat completion.
 * Lança MiniMaxError em falha — quem chama decide o fallback.
 */
export async function minimaxChat(opts: {
  messages: MiniMaxMessage[];
  tools?: MiniMaxTool[];
  toolChoice?: 'auto' | 'none' | 'required';
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}): Promise<MiniMaxResponse> {
  assertConfigured();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  if (opts.signal) opts.signal.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    const res = await fetch(`${env.MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.MINIMAX_MODEL,
        messages: opts.messages,
        tools: opts.tools,
        tool_choice: opts.toolChoice,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.maxTokens ?? 2048,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new MiniMaxError(`MiniMax respondeu ${res.status}: ${body.slice(0, 300)}`, res.status);
    }

    return (await res.json()) as MiniMaxResponse;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Atalho pra quando não há tool calling: só texto.
 * Retorna string (stringify quando o modelo devolveu tool_call sem tool disponível).
 */
export async function minimaxText(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const res = await minimaxChat({
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user },
    ],
    temperature: opts.temperature ?? 0.4,
    maxTokens: opts.maxTokens ?? 2048,
  });

  const msg = res.choices[0]?.message;
  return (msg?.content ?? '').trim();
}

/** Parse seguro dos argumentos JSON de uma tool call. */
export function parseToolArgs(args: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(args || '{}');
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}