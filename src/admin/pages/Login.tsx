// Tela de login do Super Admin — separada do app de tenant
// Acessível em admin.louvorapp.fbautomacao.space/login

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("fernandojaborges@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Erro ao entrar. Verifique suas credenciais."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-slate-900 font-bold text-2xl mb-3">
            K
          </div>
          <h1 className="text-2xl font-semibold text-white">Kairos Louvor</h1>
          <p className="text-amber-400 text-sm uppercase tracking-wider mt-1">
            Painel Super Admin
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-md px-4 py-2.5 text-sm transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-xs text-slate-500 text-center pt-2">
            Acesso restrito ao Pastor Fernando Borges.
            <br />
            <Link to="/" className="text-amber-400 hover:underline">
              ← Voltar pro app
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
