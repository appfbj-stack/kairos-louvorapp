// Lista de tenants com busca, filtro e ações em massa
// Tudo num único lugar pro Super Admin ter visão de qual cliente tá em qual estado

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listTenants,
  TenantRow,
  createTenant,
  blockTenant,
  unblockTenant,
  resetTrial,
} from "../api";

type StatusFilter = "" | "TRIAL" | "ACTIVE" | "BLOCKED" | "CANCELLED";

export default function AdminTenants() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await listTenants({ search, status, limit: 100 });
      setTenants(r.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, status]);

  async function handleBlock(t: TenantRow) {
    const motivo = prompt(`Motivo do bloqueio de "${t.name}":`, "Inadimplência");
    if (!motivo) return;
    setBusy(t.id);
    try {
      await blockTenant(t.id, motivo);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Erro ao bloquear");
    } finally {
      setBusy(null);
    }
  }

  async function handleUnblock(t: TenantRow) {
    if (!confirm(`Desbloquear "${t.name}" e dar 30 dias?`)) return;
    setBusy(t.id);
    try {
      await unblockTenant(t.id);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Erro ao desbloquear");
    } finally {
      setBusy(null);
    }
  }

  async function handleTrial(t: TenantRow) {
    if (!confirm(`Resetar trial de "${t.name}" para 10 dias?`)) return;
    setBusy(t.id);
    try {
      await resetTrial(t.id);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Erro ao resetar trial");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tenants</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium px-4 py-2 rounded-md"
        >
          + Novo tenant
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Buscar por nome ou slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Todos os status</option>
          <option value="TRIAL">Trial</option>
          <option value="ACTIVE">Ativos</option>
          <option value="BLOCKED">Bloqueados</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase text-slate-400">
            <tr>
              <th className="text-left px-4 py-3">Tenant</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Usuários</th>
              <th className="text-left px-4 py-3">Criado</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum tenant encontrado.
                </td>
              </tr>
            )}
            {tenants.map((t) => (
              <tr
                key={t.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/tenants/${t.id}`}
                    className="font-medium text-white hover:text-amber-400"
                  >
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {t.slug}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.subscriptionStatus} />
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {t._count?.users ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {t.subscriptionStatus !== "BLOCKED" && (
                      <button
                        onClick={() => handleBlock(t)}
                        disabled={busy === t.id}
                        className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded disabled:opacity-40"
                      >
                        Bloquear
                      </button>
                    )}
                    {t.subscriptionStatus === "BLOCKED" && (
                      <button
                        onClick={() => handleUnblock(t)}
                        disabled={busy === t.id}
                        className="text-xs px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded disabled:opacity-40"
                      >
                        Desbloquear
                      </button>
                    )}
                    <button
                      onClick={() => handleTrial(t)}
                      disabled={busy === t.id}
                      className="text-xs px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded disabled:opacity-40"
                    >
                      Trial
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateTenantModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "TRIAL" | "ACTIVE" | "BLOCKED" | "CANCELLED";
}) {
  const colors: Record<string, string> = {
    TRIAL: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    BLOCKED: "bg-red-500/10 text-red-400 border-red-500/30",
    CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };
  const labels: Record<string, string> = {
    TRIAL: "Trial",
    ACTIVE: "Ativo",
    BLOCKED: "Bloqueado",
    CANCELLED: "Cancelado",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${colors[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function CreateTenantModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createTenant({
        name,
        slug,
        adminName,
        adminEmail,
        adminPassword,
      });
      onCreated();
    } catch (e: any) {
      setError(e.response?.data?.error || "Erro ao criar tenant");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">Novo tenant</h2>
        <p className="text-xs text-slate-400">
          Cria um novo cliente (igreja/ministério) com seu primeiro líder.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Field label="Nome da igreja/ministério" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
        </Field>
        <Field
          label="Slug (subdomínio)"
          required
          hint="Apenas letras minúsculas, números e hífens. Ex: 'minha-igreja'"
        >
          <input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            required
            pattern="[a-z0-9-]+"
            className="input font-mono"
          />
        </Field>

        <div className="border-t border-slate-800 pt-3 mt-3">
          <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">
            Primeiro líder
          </div>
          <Field label="Nome" required>
            <input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
              className="input"
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              className="input"
            />
          </Field>
          <Field label="Senha inicial" required hint="Mínimo 8 caracteres">
            <input
              type="text"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              minLength={8}
              className="input"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-slate-800 hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium disabled:opacity-50"
          >
            {submitting ? "Criando..." : "Criar tenant"}
          </button>
        </div>

        <style>{`
          .input {
            width: 100%;
            background: rgb(2 6 23);
            border: 1px solid rgb(51 65 85);
            border-radius: 0.375rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            color: white;
          }
          .input:focus { outline: none; border-color: rgb(245 158 11); }
        `}</style>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
