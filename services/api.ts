/**
 * api.ts — Client da API do Kairos Louvor.
 *
 * Guarda o JWT, injeta o header Authorization e normaliza os shapes
 * entre o banco (Prisma) e os tipos que o frontend usa.
 */

import type {
  ChatMessage,
  Event,
  Notice,
  Song,
  User,
  MinistrySettings,
} from '../types';

const TOKEN_KEY = 'louvor_token';
const BASE = '/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Token ────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

/** Disparado quando o token expira — o AuthContext escuta e desloga. */
export const onUnauthorized = { handler: null as null | (() => void) };

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, ...init } = options;
  const headers: Record<string, string> = {
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const token = getToken();
  if (token && !skipAuth) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet.', 0);
  }

  if (res.status === 401 && !skipAuth) {
    setToken(null);
    onUnauthorized.handler?.();
    throw new ApiError('Sessão expirada. Entre novamente.', 401);
  }

  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(payload?.error || `Erro ${res.status}`, res.status);
  }
  return payload as T;
}

const get = <T>(p: string) => request<T>(p);
const post = <T>(p: string, body?: unknown) =>
  request<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
const patch = <T>(p: string, body: unknown) =>
  request<T>(p, { method: 'PATCH', body: JSON.stringify(body) });
const put = <T>(p: string, body: unknown) =>
  request<T>(p, { method: 'PUT', body: JSON.stringify(body) });
const del = <T>(p: string) => request<T>(p, { method: 'DELETE' });

type Envelope<T> = { success: boolean; data: T; total?: number };

// ── Mapeadores (banco → tipos do frontend) ───────────────────────

/** O banco guarda createdAt; a tela usa date. */
const toNotice = (n: any): Notice => ({
  id: n.id,
  title: n.title,
  content: n.content,
  date: n.createdAt,
  isPinned: !!n.isPinned,
  authorName: n.authorName,
});

const toChatMessage = (m: any, users: User[]): ChatMessage => {
  const sender = users.find((u) => u.id === m.senderId);
  return {
    id: m.id,
    senderId: m.senderId,
    senderName: m.senderName,
    senderRole: m.senderRole,
    senderFunction: sender?.function ?? '',
    content: m.content,
    timestamp: m.createdAt,
  };
};

const toEvent = (e: any): Event => ({
  id: e.id,
  title: e.title,
  type: e.type,
  date: e.date,
  time: e.time,
  location: e.location,
  observations: e.observations ?? '',
  scale: Array.isArray(e.scale) ? e.scale : [],
});

const toSong = (s: any): Song => ({
  id: s.id,
  title: s.title,
  artist: s.artist,
  key: s.key,
  lyrics: s.lyrics,
  arrangement: s.arrangement ?? '',
  chordsUrl: s.chordsUrl ?? undefined,
  youtubeUrl: s.youtubeUrl ?? undefined,
  driveUrl: s.driveUrl ?? undefined,
  audioUrl: s.audioUrl ?? undefined,
});

const toUser = (u: any): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  function: u.function ?? 'Voz',
  instrument: u.instrument ?? '',
  phone: u.phone ?? '',
});

// ── Auth ─────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    post<{ success: boolean; token: string; user: any }>('/auth/login', { email, password }).then(
      (r) => {
        setToken(r.token);
        return { token: r.token, user: toUser(r.user) };
      },
    ),

  /** Cria uma igreja nova (trial de 10 dias) + o líder. Já devolve o token. */
  signup: (data: {
    tenantName: string;
    tenantSlug: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }) =>
    post<{ success: boolean; token: string; user: any }>('/auth/signup-tenant', data).then((r) => {
      setToken(r.token);
      return { token: r.token, user: toUser(r.user) };
    }),

  me: () => get<Envelope<any>>('/auth/me').then((r) => toUser(r.data)),
};

// ── Songs ────────────────────────────────────────────────────────
export const songsApi = {
  list: (params: { search?: string; key?: string } = {}) => {
    const q = new URLSearchParams({ limit: '200' });
    if (params.search) q.set('search', params.search);
    if (params.key) q.set('key', params.key);
    return get<Envelope<any[]>>(`/songs?${q}`).then((r) => r.data.map(toSong));
  },
  create: (song: Partial<Song>) =>
    post<Envelope<any>>('/songs', song).then((r) => toSong(r.data)),
  update: (id: string, patchBody: Partial<Song>) =>
    patch<Envelope<any>>(`/songs/${id}`, patchBody).then((r) => toSong(r.data)),
  remove: (id: string) => del<{ success: boolean }>(`/songs/${id}`),
};

// ── Events ───────────────────────────────────────────────────────
export const eventsApi = {
  list: () => get<Envelope<any[]>>('/events?limit=200').then((r) => r.data.map(toEvent)),
  create: (event: Partial<Event>) =>
    post<Envelope<any>>('/events', event).then((r) => toEvent(r.data)),
  update: (id: string, body: Partial<Event>) =>
    patch<Envelope<any>>(`/events/${id}`, body).then((r) => toEvent(r.data)),
  remove: (id: string) => del<{ success: boolean }>(`/events/${id}`),
};

// ── Notices ──────────────────────────────────────────────────────
export const noticesApi = {
  list: () => get<Envelope<any[]>>('/notices').then((r) => r.data.map(toNotice)),
  create: (n: Partial<Notice>) =>
    post<Envelope<any>>('/notices', n).then((r) => toNotice(r.data)),
  update: (id: string, body: Partial<Notice>) =>
    patch<Envelope<any>>(`/notices/${id}`, body).then((r) => toNotice(r.data)),
  remove: (id: string) => del<{ success: boolean }>(`/notices/${id}`),
};

// ── Members ──────────────────────────────────────────────────────
export const membersApi = {
  list: () => get<Envelope<any[]>>('/members').then((r) => r.data.map(toUser)),
  create: (m: Partial<User> & { password: string }) =>
    post<Envelope<any>>('/members', m).then((r) => toUser(r.data)),
  update: (id: string, body: Partial<User> & { password?: string }) =>
    patch<Envelope<any>>(`/members/${id}`, body).then((r) => toUser(r.data)),
  remove: (id: string) => del<{ success: boolean }>(`/members/${id}`),
};

// ── Chat da equipe ───────────────────────────────────────────────
export const chatApi = {
  list: (users: User[] = []) =>
    get<Envelope<any[]>>('/chat?limit=200').then((r) => r.data.map((m) => toChatMessage(m, users))),
  send: (content: string) => post<Envelope<any>>('/chat', { content }).then((r) => r.data),
  remove: (id: string) => del<{ success: boolean }>(`/chat/${id}`),
  clear: () => del<{ success: boolean; count: number }>('/chat'),
};

// ── Settings ─────────────────────────────────────────────────────
export const settingsApi = {
  get: () => get<Envelope<MinistrySettings & { id: string }>>('/settings').then((r) => r.data),
  save: (s: Partial<MinistrySettings>) =>
    put<Envelope<MinistrySettings>>('/settings', s).then((r) => r.data),
};

// ── IA (MiniMax / Kairós) ────────────────────────────────────────
export interface KairosToolUse {
  name: string;
  args: Record<string, unknown>;
}
export interface KairosResponse {
  reply: string;
  toolsUsed: KairosToolUse[];
  iterations: number;
}

export const aiApi = {
  chat: (message: string, history: Array<{ role: string; content: string }> = []) =>
    post<Envelope<KairosResponse>>('/ai/chat', { message, history }).then((r) => r.data),

  tools: () => get<Envelope<Array<{ name: string; description: string; write: boolean }>>>('/ai/tools').then((r) => r.data),

  transpose: (lyrics: string, fromKey: string, toKey: string) =>
    post<Envelope<{ lyrics: string }>>('/ai/transpose', { lyrics, fromKey, toKey }).then((r) => r.data.lyrics),

  formatLyrics: (lyrics: string) =>
    post<Envelope<{ lyrics: string }>>('/ai/format-lyrics', { lyrics }).then((r) => r.data.lyrics),

  refineNotice: (content: string) =>
    post<Envelope<{ content: string }>>('/ai/refine-notice', { content }).then((r) => r.data.content),

  reflection: (songs: string[]) =>
    post<Envelope<{ reflection: string }>>('/ai/reflection', { songs }).then((r) => r.data.reflection),
};