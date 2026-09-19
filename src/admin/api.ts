// Admin API client — chamadas autenticadas pro backend (JWT via header)
// O painel usa o MESMO backend do app; a única diferença é a UI.

import axios from "axios";

const TOKEN_KEY = "kairos_admin_token";
const ADMIN_KEY = "kairos_admin_user";

export const adminApi = axios.create({
  baseURL: "", // mesma origem (mesmo domínio = mesma API)
  timeout: 30000,
});

// ── Interceptor: injeta token em toda requisição ──
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor: se 401, limpa sessão e redireciona ──
adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export const adminToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
};

export const adminUser = {
  get: (): { id: string; name: string; email: string; role: string } | null => {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (u: { id: string; name: string; email: string; role: string }) =>
    localStorage.setItem(ADMIN_KEY, JSON.stringify(u)),
  clear: () => localStorage.removeItem(ADMIN_KEY),
};

// ── Endpoints ─────────────────────────────────────────────────

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  active: boolean;
  subscriptionStatus: "TRIAL" | "ACTIVE" | "BLOCKED" | "CANCELLED";
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  motivoBloqueio: string | null;
  bloqueadoEm: string | null;
  bloqueadoPor: string | null;
  createdAt: string;
  _count?: { users: number; songs: number; events: number };
}

export interface Stats {
  totals: {
    tenants: number;
    activeTenants: number;
    trialTenants: number;
    blockedTenants: number;
    cancelledTenants: number;
    users: number;
  };
  recent: {
    newTenantsLast7d: number;
    newUsersLast7d: number;
  };
}

export interface AuditRow {
  id: string;
  superAdminId: string;
  superAdminEmail: string;
  action: string;
  targetId: string | null;
  details: any;
  createdAt: string;
}

export async function login(email: string, password: string) {
  const { data } = await adminApi.post("/api/auth/login", { email, password });
  if (data.user.role !== "SUPER_ADMIN") {
    throw new Error("Acesso restrito ao administrador do sistema.");
  }
  adminToken.set(data.token);
  adminUser.set(data.user);
  return data;
}

export async function getStats(): Promise<Stats> {
  const { data } = await adminApi.get("/api/super-admin/stats");
  return data.data;
}

export async function listTenants(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await adminApi.get("/api/super-admin/tenants", { params });
  return data; // { data: TenantRow[], pagination: {...} }
}

export async function getTenant(id: string): Promise<TenantRow> {
  const { data } = await adminApi.get(`/api/super-admin/tenants/${id}`);
  return data.data;
}

export async function createTenant(payload: {
  name: string;
  slug: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}) {
  const { data } = await adminApi.post("/api/super-admin/tenants", payload);
  return data;
}

export async function blockTenant(id: string, motivo: string) {
  const { data } = await adminApi.post(`/api/super-admin/tenants/${id}/block`, { motivo });
  return data;
}

export async function unblockTenant(id: string) {
  const { data } = await adminApi.post(`/api/super-admin/tenants/${id}/unblock`);
  return data;
}

export async function resetTrial(id: string) {
  const { data } = await adminApi.post(`/api/super-admin/tenants/${id}/trial`);
  return data;
}

export async function deleteTenant(id: string) {
  const { data } = await adminApi.delete(`/api/super-admin/tenants/${id}`);
  return data;
}

export async function getAuditLog(params: { page?: number; limit?: number }) {
  const { data } = await adminApi.get("/api/super-admin/audit", { params });
  return data;
}
