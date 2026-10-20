import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Music4, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Preencha e-mail e senha');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch {
      /* o erro vem do AuthContext */
    } finally {
      setBusy(false);
    }
  };

  const message = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 text-white shadow-2xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Music4 size={30} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-blue-400">Kairos Louvor</h1>
          <p className="text-slate-400 text-sm">Entre com o acesso do seu ministério</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@igreja.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 outline-none focus:border-blue-500/60 focus:bg-white/10 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 outline-none focus:border-blue-500/60 focus:bg-white/10 transition-colors"
            />
          </div>

          {message && (
            <div className="flex items-start gap-2.5 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-2xl px-4 py-3">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold shadow-lg shadow-blue-900/40 transition-all"
          >
            {busy ? <Loader2 size={19} className="animate-spin" /> : <LogIn size={19} />}
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center leading-relaxed">
          Os dados do seu ministério ficam salvos na nuvem e são acessados de qualquer
          celular, pelo seu login.
        </p>
      </div>
    </div>
  );
};

export default Login;