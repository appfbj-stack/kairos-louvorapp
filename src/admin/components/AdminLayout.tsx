// Layout do painel administrativo — limpo, focado em densidade de informação
// Paleta: slate-900 (fundo) + amber-500 (ação primária) — separada do app de louvor

import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminToken, adminUser } from "../api";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { to: "/admin/tenants", label: "Tenants", icon: "🏛️" },
  { to: "/admin/audit", label: "Audit Log", icon: "📜" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = adminUser.get();

  function logout() {
    adminToken.clear();
    window.location.href = "/admin/login";
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold">
              K
            </div>
            <div>
              <div className="font-semibold text-sm">Kairos Louvor</div>
              <div className="text-[10px] text-amber-400 uppercase tracking-wider">
                Super Admin
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(item.to, item.exact)
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Logado como</div>
          <div className="text-sm font-medium truncate">{user?.name}</div>
          <div className="text-[11px] text-slate-500 truncate mb-3">
            {user?.email}
          </div>
          <button
            onClick={logout}
            className="w-full text-xs px-3 py-2 rounded-md bg-slate-800 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
