// Detalhe de um tenant: dados + histórico de bloqueios + audit log específico

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getTenant,
  blockTenant,
  unblockTenant,
  resetTrial,
  deleteTenant,
  TenantRow,
} from "../api";

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const t = await getTenant(id);
      setTenant(t);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleBlock() {
    if (!tenant) return;
    const motivo = prompt(`Motivo do bloqueio de "${tenant.name}":`);
    if (!motivo) return;
    setBusy(true);
    try {
      await blockTenant(tenant.id, motivo);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleUnblock() {
    if (!tenant) return;
    if (!confirm(`Desbloquear "${tenant.name}" e dar 30 dias?`)) return;
    setBusy(true);
    try {
      await unblockTenant(tenant.id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleTrial() {
    if (!tenant) return;
    if (!confirm(`Resetar trial de "${tenant.name}" para 10 dias?`)) return;
    setBusy(true);
    try {
      await resetTrial(tenant.id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!tenant) return;
    const confirmText = prompt(
      `Tem certeza que quer DELETAR "${tenant.name}"? Digite o slug "${tenant.slug}" pra confirmar:`
    );
    if (confirmText !== tenant.slug) return;
    setBusy(true);
    try {
      await deleteTenant(tenant.id);
      navigate("/admin/tenants");
    } catch (e: any) {
      alert(e.response?.data?.error || "Erro ao deletar");
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="text-slate-400">Carregando...</div>;
  }
  if (!tenant) {
    return <div className="text-slate-400">Tenant não encontrado.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/tenants"
          className="text-xs text-amber-400 hover:underline"
        >
          ← Voltar pra lista
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold">{tenant.name}</h1>
            <div className="text-sm text-slate-400 font-mono">
              {tenant.slug}.louvorapp.fbautomacao.space
            </div>
          </div>
          <StatusBadge status={tenant.subscriptionStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informações">
            <Info label="ID" value={tenant.id} mono />
            <Info label="Slug" value={tenant.slug} mono />
            <Info
              label="Criado em"
              value={new Date(tenant.createdAt).toLocaleString("pt-BR")}
            />
            <Info
              label="Trial expira em"
              value={
                tenant.trialEndsAt
                  ? new Date(tenant.trialEndsAt).toLocaleDateString("pt-BR")
                  : "—"
              }
            />
            <Info
              label="Assinatura até"
              value={
                tenant.subscriptionEndsAt
                  ? new Date(tenant.subscriptionEndsAt).toLocaleDateString(
                      "pt-BR"
                    )
                  : "—"
              }
            />
            <Info
              label="Usuários"
              value={String(tenant._count?.users ?? 0)}
            />
            <Info
              label="Músicas"
              value={String(tenant._count?.songs ?? 0)}
            />
            <Info
              label="Eventos"
              value={String(tenant._count?.events ?? 0)}
            />
          </Card>

          {tenant.subscriptionStatus === "BLOCKED" && (
            <Card title="Bloqueio">
              <Info
                label="Motivo"
                value={tenant.motivoBloqueio || "—"}
              />
              <Info
                label="Bloqueado em"
                value={
                  tenant.bloqueadoEm
                    ? new Date(tenant.bloqueadoEm).toLocaleString("pt-BR")
                    : "—"
                }
              />
              <Info
                label="Bloqueado por"
                value={tenant.bloqueadoPor || "—"}
              />
            </Card>
          )}
        </div>

        {/* Ações */}
        <div>
          <Card title="Ações">
            <div className="space-y-2">
              {tenant.subscriptionStatus !== "BLOCKED" && (
                <button
                  onClick={handleBlock}
                  disabled={busy}
                  className="w-full text-left px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-sm disabled:opacity-40"
                >
                  🔒 Bloquear tenant
                </button>
              )}
              {tenant.subscriptionStatus === "BLOCKED" && (
                <button
                  onClick={handleUnblock}
                  disabled={busy}
                  className="w-full text-left px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-sm disabled:opacity-40"
                >
                  🔓 Desbloquear (30 dias)
                </button>
              )}
              <button
                onClick={handleTrial}
                disabled={busy}
                className="w-full text-left px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded text-sm disabled:opacity-40"
              >
                ⏱ Resetar trial (10 dias)
              </button>
              <a
                href={`https://${tenant.slug}.louvorapp.fbautomacao.space`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-left px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded text-sm"
              >
                ↗ Abrir app do tenant
              </a>
              <hr className="border-slate-800 my-3" />
              <button
                onClick={handleDelete}
                disabled={busy}
                className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded text-sm disabled:opacity-40"
              >
                🗑 Deletar tenant (cuidado!)
              </button>
            </div>
          </Card>
        </div>
      </div>
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
      className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded border ${colors[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-slate-500 w-32 shrink-0">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}
