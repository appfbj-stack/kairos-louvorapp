// AdminApp — Router isolado do painel super admin
// Detectado em window.location.hostname.startsWith('admin.')
// Renderiza APENAS o painel; sem Layout/Sidebar do app de louvor

import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import AdminLogin from "./pages/Login";
import AdminDashboard from "./pages/Dashboard";
import AdminTenants from "./pages/Tenants";
import TenantDetail from "./pages/TenantDetail";
import AuditLog from "./pages/AuditLog";
import { adminToken, adminUser } from "./api";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = adminToken.get();
  const user = adminUser.get();

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-2">🔒</div>
          <div className="text-lg">Acesso restrito ao Super Admin.</div>
          <a
            href="/admin/login"
            className="text-amber-400 text-sm hover:underline"
          >
            Voltar pro login
          </a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/tenants"
          element={
            <RequireAuth>
              <AdminLayout>
                <AdminTenants />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/tenants/:id"
          element={
            <RequireAuth>
              <AdminLayout>
                <TenantDetail />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/audit"
          element={
            <RequireAuth>
              <AdminLayout>
                <AuditLog />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
