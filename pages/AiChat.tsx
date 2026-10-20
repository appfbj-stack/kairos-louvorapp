/**
 * AiChat.tsx — Kairós, o assistente do ministério.
 *
 * Conversa com o MiniMax, que consulta e altera os dados do tenant pelas
 * ferramentas do backend. Mostra quais ferramentas foram usadas pra o líder
 * confiar no que a IA leu de verdade.
 */

import React, { useEffect, useRef, useState } from 'react';
import { aiApi, type KairosToolUse } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Wrench, Loader2, Trash2, User } from 'lucide-react';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tools?: KairosToolUse[];
  failed?: boolean;
}

const SUGESTOES = [
  'Como está o ministério?',
  'Quais músicas tem no repertório?',
  'Quem está na equipe?',
  'Qual o próximo evento?',
];

export const AiChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (texto: string) => {
    const pergunta = texto.trim();
    if (!pergunta || busy) return;

    setInput('');
    const minhaMsg: Msg = { id: `u_${Date.now()}`, role: 'user', content: pergunta };
    setMessages((prev) => [...prev, minhaMsg]);
    setBusy(true);

    // histórico vai pro backend pra a IA manter o contexto da conversa
    const history = messages
      .filter((m) => !m.failed)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await aiApi.chat(pergunta, history);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          tools: res.toolsUsed,
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content: e?.message || 'Não consegui falar com o Kairós agora. Tenta de novo.',
          failed: true,
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const isLeader = user?.role === 'LEADER' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] min-h-[520px] bg-slate-900 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/5 bg-gradient-to-r from-violet-900/30 via-blue-900/20 to-transparent">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/40 shrink-0">
            <Sparkles size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white leading-tight">Kairós</h1>
            <p className="text-xs text-slate-400 truncate">
              {isLeader
                ? 'Consulta e altera os dados do seu ministério'
                : 'Consulta o repertório, a agenda e a equipe'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Limpar conversa"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      {/* Conversa */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="max-w-lg mx-auto text-center pt-10 space-y-7">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-900/40">
              <Sparkles size={34} className="text-white" />
            </div>
            <div className="space-y-2.5">
              <h2 className="text-2xl font-serif font-bold text-white">Oi, {user?.name?.split(' ')[0]}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pergunte sobre o repertório, a agenda ou a equipe.{' '}
                {isLeader && 'Também posso cadastrar músicas, eventos e avisos pra você.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 rounded-2xl text-sm text-slate-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={15} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${m.role === 'user' ? 'order-1' : ''}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : m.failed
                      ? 'bg-rose-500/10 border border-rose-500/25 text-rose-200 rounded-tl-sm'
                      : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
              {m.tools && m.tools.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Wrench size={12} className="text-slate-500" />
                  {m.tools.map((t, i) => (
                    <span
                      key={`${m.id}_${i}`}
                      className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/25 rounded-md text-[10px] font-mono text-violet-300"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User size={15} className="text-slate-200" />
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 flex items-center gap-2.5 text-sm text-slate-400">
              <Loader2 size={15} className="animate-spin" />
              consultando o seu ministério...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Campo de envio */}
      <div className="border-t border-white/5 p-4 bg-slate-950/60 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2.5 max-w-4xl mx-auto"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Pergunte sobre o repertório, a agenda ou a equipe..."
            className="flex-1 bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/10 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-slate-600 outline-none resize-none transition-colors max-h-[140px]"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-violet-900/30 transition-all"
          >
            <Send size={18} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChat;