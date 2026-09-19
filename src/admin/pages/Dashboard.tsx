// Dashboard do Super Admin — visão geral da plataforma
// Cards de stats + ação rápida (criar tenant)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats, Stats, listTenants, TenantRow } from "../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTenants, setRecentTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([
          getStats(),
          listTenants({ limit: 5 }),
        ]);
        setStats(s);
        setRecentTenants(t.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-slate-400 text-sm">Carregando dashboard...</div>
    );
  }

  const cards = [
    {
      label: "Tenants ativos",
      value: stats?.totals.activeTenants ?? 0,
      color: "emerald",
      icon: "✓",
    },
    {
      label: "Em trial",
      value: stats?.totals.trialTenants ?? 0,
      color: "amber",
      icon: "⏱",
    },
    {
      label: "Bloqueados",
      value: stats?.totals.blockedTenants ?? 0,
      color: "red",
      icon: "✕",
    },
    {
      label: "Total de usuários",
      value: stats?.totals.users ?? 0,
      color: "sky",
      icon: "👥",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          to="/admin/tenants"
          className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium px-4 py-2 rounded-md"
        >
          + Novo tenant
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-slate-900 border border-slate-800 rounded-lg p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                {c.label}
              </span>
              <span className="text-lg">{c.icon}</span>
            </div>
            <div className={`text-3xl font-bold text-${c.color}-400`}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos tenants criados */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="font-semibold mb-4 flex items-center justify-between">
            <span>Últimos tenants criados</span>
            <Link
              to="/admin/tenants"
              className="text-xs text-amber-400 hover:underline"
            >
              ver todos →
            </Link>
          </h2>
          <div className="space-y-2">
            {recentTenants.length === 0 && (
              <div className="text-sm text-slate-500">
                Nenhum tenant criado ainda.
              </div>
            )}
            {recentTenants.map((t) => (
              <Link
                key={t.id}
                to={`/admin/tenants/${t.id}`}
                className="flex items-center justify-between p-3 bg-slate-950/50 hover:bg-slate-800 rounded-md transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.slug}.louvorapp.fbautomacao.space
                  </div>
                </div>
                <StatusBadge status={t.subscriptionStatus} />
              </Link>
            ))}
          </div>
        </div>

        {/* Atividade recente (resumo) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="font-semibold mb-4">Atividade (últimos 7 dias)</h2>
          <div className="space-y-3">
            <StatLine
              label="Novos tenants"
              value={stats?.recent.newTenantsLast7d ?? 0}
            />
            <StatLine
              label="Novos usuários"
              value={stats?.recent.newUsersLast7d ?? 0}
            />
            <StatLine
              label="Total de tenants"
              value={stats?.totals.tenants ?? 0}
            />
            <StatLine
              label="Cancelados"
              value={stats?.totals.cancelledTenants ?? 0}
            />
          </div>
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
      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${colors[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function StatLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
