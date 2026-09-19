// Audit log do Super Admin — rastreia TUDO que o admin fizer
// Útil pra debug e pra prestação de contas

import { useEffect, useState } from "react";
import { getAuditLog, AuditRow } from "../api";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  BLOCK_TENANT: { label: "Bloqueou tenant", color: "red" },
  UNBLOCK_TENANT: { label: "Desbloqueou tenant", color: "emerald" },
  RESET_TRIAL: { label: "Resetou trial", color: "amber" },
  CREATE_TENANT: { label: "Criou tenant", color: "sky" },
  UPDATE_TENANT: { label: "Editou tenant", color: "slate" },
  DELETE_TENANT: { label: "Deletou tenant", color: "red" },
  SEED_INITIAL: { label: "Seed inicial", color: "slate" },
};

export default function AuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  async function load() {
    setLoading(true);
    try {
      const r = await getAuditLog({ page, limit });
      setRows(r.data || []);
      setTotal(r.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Audit Log</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase text-slate-400">
            <tr>
              <th className="text-left px-4 py-3">Quando</th>
              <th className="text-left px-4 py-3">Quem</th>
              <th className="text-left px-4 py-3">Ação</th>
              <th className="text-left px-4 py-3">Alvo</th>
              <th className="text-left px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhuma ação registrada ainda.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const meta = ACTION_LABELS[row.action] || {
                label: row.action,
                color: "slate",
              };
              return (
                <tr
                  key={row.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(row.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {row.superAdminEmail}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border bg-${meta.color}-500/10 text-${meta.color}-400 border-${meta.color}-500/30`}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {row.targetId?.slice(0, 8) || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                    {row.details ? JSON.stringify(row.details) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-slate-400">
            Mostrando {(page - 1) * limit + 1}–
            {Math.min(page * limit, total)} de {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
