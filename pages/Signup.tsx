/**
 * Signup.tsx — Cadastro grátis: cria a igreja e o líder, e já entra no app.
 *
 * É o destino do CTA "Testar agora de graça" da landing de vendas.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Music4, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export const Signup: React.FC<{ onVoltar: () => void }> = ({ onVoltar }) => {
  const { setUserFromSignup } = useAuth();
  const [form, setForm] = useState({
    tenantName: '',
    tenantSlug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.adminPassword.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres');
      return;
    }
    const slug = slugify(form.tenantSlug);
    if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
      setError('O identificador usa só letras minúsculas, números e hífen');
      return;
    }

    setBusy(true);
    try {
      const { user } = await authApi.signup({
        tenantName: form.tenantName.trim(),
        tenantSlug: slug,
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
      });
      setUserFromSignup(user);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível criar sua conta');
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [k]: value };
      // gera o identificador sozinho enquanto o usuário não editar
      if (k === 'tenantName' && !slugTouched) next.tenantSlug = slugify(value);
      return next;
    });
  };

  const field =
    'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 outline-none focus:border-violet-500/60 focus:bg-white/10 transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 py-12">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 text-white shadow-2xl">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para o login
        </button>

        <div className="text-center space-y-3 mb-7">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <Music4 size={30} />
          </div>
          <h1 className="text-2xl font-serif font-bold">Comece grátis</h1>
          <p className="text-slate-400 text-sm">10 dias de teste. Sem cartão de crédito.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Nome da igreja
            </label>
            <input
              required
              value={form.tenantName}
              onChange={set('tenantName')}
              placeholder="Igreja Batista da Serra"
              className={field}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Identificador
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 text-sm shrink-0">louvorapp/</span>
              <input
                required
                value={form.tenantSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('tenantSlug')(e);
                }}
                placeholder="igreja-serra"
                className={field}
              />
            </div>
            <p className="text-xs text-slate-500">
              É o endereço da sua igreja dentro do app.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Seu nome
            </label>
            <input
              required
              value={form.adminName}
              onChange={set('adminName')}
              placeholder="Fernando Borges"
              className={field}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              E-mail
            </label>
            <input
              required
              type="email"
              value={form.adminEmail}
              onChange={set('adminEmail')}
              placeholder="voce@igreja.com"
              className={field}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Senha
            </label>
            <input
              required
              minLength={6}
              type="password"
              value={form.adminPassword}
              onChange={set('adminPassword')}
              placeholder="mínimo 6 caracteres"
              className={field}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-2xl px-4 py-3">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold shadow-lg shadow-violet-900/40 transition-all"
          >
            {busy ? <Loader2 size={19} className="animate-spin" /> : <Check size={19} />}
            {busy ? 'Criando...' : 'Criar conta e entrar'}
          </button>
        </form>

        <ul className="mt-6 pt-6 border-t border-white/10 space-y-2">
          {[
            'Repertório, agenda, mural e equipe ilimitados',
            'Kairós, o assistente de IA do seu ministério',
            'Instala no celular como aplicativo',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-slate-400">
              <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Signup;