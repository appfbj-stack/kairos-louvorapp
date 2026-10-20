/**
 * DataContext.tsx — Estado do tenant agora vem da API (Postgres), não do navegador.
 *
 * A interface pública foi mantida igual à versão localStorage de propósito:
 * as 14 telas existentes continuam consumindo exatamente os mesmos hooks.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Song, Event, Notice, MinistrySettings, ChatMessage, PresenceStatus } from '../types';
import {
  songsApi,
  eventsApi,
  noticesApi,
  membersApi,
  chatApi,
  settingsApi,
} from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: User[];
  songs: Song[];
  events: Event[];
  notices: Notice[];
  settings: MinistrySettings;
  chatMessages: ChatMessage[];
  readNoticeIds: string[];
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;

  addUser: (user: User & { password?: string }) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addSong: (song: Song) => Promise<void>;
  updateSong: (song: Song) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  addEvent: (event: Event) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addNotice: (notice: Notice) => Promise<void>;
  updateNotice: (notice: Notice) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  updateSettings: (settings: MinistrySettings) => Promise<void>;
  updateEventStatus: (eventId: string, userId: string, status: PresenceStatus) => Promise<void>;
  addChatMessage: (content: string) => Promise<void>;
  clearChat: () => Promise<void>;
  markNoticeAsRead: (id: string) => void;
  markAllNoticesAsRead: () => void;
  exportData: () => string;
  importData: (json: string) => Promise<boolean>;
}

const DEFAULT_SETTINGS: MinistrySettings = {
  name: 'Kairos Louvor',
  churchName: 'Igreja Local',
  youtubeChannel: '',
  driveFolder: '',
  spotifyPlaylist: '',
  instagram: '',
  allowMemberChat: true,
  allowMemberNotices: true,
  confirmationDeadlineDays: 3,
  enableVocalTraining: true,
  enableVideoLessons: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [settings, setSettings] = useState<MinistrySettings>(DEFAULT_SETTINGS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(
    () => JSON.parse(localStorage.getItem('louvor_read_notice_ids') || '[]'),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // currentUserId continua existindo (as telas usam), mas vem da sessão real
  const currentUserId = authUser?.id ?? null;
  const setCurrentUserId = useCallback(() => {}, []);

  // Avisos lidos é o único estado que fica local (é por aparelho, não do ministry)
  useEffect(() => {
    localStorage.setItem('louvor_read_notice_ids', JSON.stringify(readNoticeIds));
  }, [readNoticeIds]);

  const reload = useCallback(async () => {
    if (!authUser) return;
    setError(null);
    try {
      // membros primeiro: o chat usa a função de cada sender
      const [us, sg, ev, nt, st, cm] = await Promise.all([
        membersApi.list(),
        songsApi.list(),
        eventsApi.list(),
        noticesApi.list(),
        settingsApi.get(),
        chatApi.list(),
      ]);
      setUsers(us);
      setSongs(sg);
      setEvents(ev);
      setNotices(nt);
      setSettings({ ...DEFAULT_SETTINGS, ...st });
      setChatMessages(
        cm.map((m) => ({ ...m, senderFunction: us.find((u) => u.id === m.senderId)?.function ?? '' })),
      );
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar os dados');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      setLoading(true);
      reload();
    } else {
      // logout: limpa tudo pra não vazar dados entre contas no mesmo aparelho
      setUsers([]);
      setSongs([]);
      setEvents([]);
      setNotices([]);
      setChatMessages([]);
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
    }
  }, [authUser, reload]);

  // ── Membros ───────────────────────────────────────────────────
  const addUser = async (u: User & { password?: string }) => {
    if (!u.password) throw new Error('Defina uma senha para o novo membro');
    const created = await membersApi.create({ ...u, password: u.password });
    setUsers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateUser = async (u: User) => {
    const updated = await membersApi.update(u.id, u);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
  };

  const deleteUser = async (id: string) => {
    await membersApi.remove(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // ── Músicas ───────────────────────────────────────────────────
  const addSong = async (s: Song) => {
    const created = await songsApi.create(s);
    setSongs((prev) => [created, ...prev]);
  };

  const updateSong = async (s: Song) => {
    const updated = await songsApi.update(s.id, s);
    setSongs((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
  };

  const deleteSong = async (id: string) => {
    await songsApi.remove(id);
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Eventos ───────────────────────────────────────────────────
  const addEvent = async (e: Event) => {
    const created = await eventsApi.create(e);
    setEvents((prev) => [...prev, created]);
  };

  const updateEvent = async (e: Event) => {
    const updated = await eventsApi.update(e.id, e);
    setEvents((prev) => prev.map((x) => (x.id === e.id ? updated : x)));
  };

  const deleteEvent = async (id: string) => {
    await eventsApi.remove(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEventStatus = async (
    eventId: string,
    userId: string,
    status: PresenceStatus,
  ) => {
    // atualização otimista: a tela responde na hora, o servidor confirma depois
    let nextScale: Event['scale'] = [];
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        nextScale = ev.scale.map((s) => (s.userId === userId ? { ...s, status } : s));
        return { ...ev, scale: nextScale };
      }),
    );
    try {
      const updated = await eventsApi.update(eventId, { scale: nextScale });
      setEvents((prev) => prev.map((x) => (x.id === eventId ? updated : x)));
    } catch (e: any) {
      setError(e?.message || 'Não foi possível atualizar a escala');
      await reload();
    }
  };

  // ── Avisos ────────────────────────────────────────────────────
  const addNotice = async (n: Notice) => {
    let created = await noticesApi.create(n);
    if (n.isPinned) {
      // o banco só garante 1 fixado no PATCH — então desmarca os antigos
      const others = notices.filter((x) => x.isPinned && x.id !== created.id);
      await Promise.all(others.map((x) => noticesApi.update(x.id, { isPinned: false })));
      setNotices((prev) => [created, ...prev.map((x) => ({ ...x, isPinned: false }))]);
    } else {
      setNotices((prev) => [created, ...prev]);
    }
    return created;
  };

  const updateNotice = async (n: Notice) => {
    const updated = await noticesApi.update(n.id, n);
    setNotices((prev) => prev.map((x) => (x.id === n.id ? updated : x)));
  };

  const deleteNotice = async (id: string) => {
    await noticesApi.remove(id);
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  // ── Configurações ────────────────────────────────────────────
  const updateSettings = async (s: MinistrySettings) => {
    const saved = await settingsApi.save(s);
    setSettings({ ...DEFAULT_SETTINGS, ...saved });
  };

  // ── Chat ──────────────────────────────────────────────────────
  const addChatMessage = async (content: string) => {
    const text = content.trim();
    if (!text) return;
    const created = await chatApi.send(text);
    setChatMessages((prev) => [
      ...prev,
      {
        id: created.id,
        senderId: created.senderId,
        senderName: created.senderName,
        senderRole: created.senderRole,
        senderFunction: users.find((u) => u.id === created.senderId)?.function ?? '',
        content: created.content,
        timestamp: created.createdAt,
      },
    ]);
  };

  const clearChat = async () => {
    await chatApi.clear();
    setChatMessages([]);
  };

  // ── Avisos lidos (local) ──────────────────────────────────────
  const markNoticeAsRead = useCallback((id: string) => {
    setReadNoticeIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllNoticesAsRead = useCallback(() => {
    setReadNoticeIds(notices.map((n) => n.id));
  }, [notices]);

  // ── Backup ────────────────────────────────────────────────────
  const exportData = () =>
    JSON.stringify({ users, songs, events, notices, settings }, null, 2);

  const importData = async (json: string): Promise<boolean> => {
    try {
      const data = JSON.parse(json);
      for (const s of data.songs ?? []) {
        await songsApi.create(s);
      }
      for (const e of data.events ?? []) {
        await eventsApi.create(e);
      }
      for (const n of data.notices ?? []) {
        await noticesApi.create({ ...n, authorId: undefined });
      }
      await reload();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        users,
        songs,
        events,
        notices,
        settings,
        chatMessages,
        readNoticeIds,
        currentUserId,
        setCurrentUserId,
        loading,
        error,
        reload,
        addUser,
        updateUser,
        deleteUser,
        addSong,
        updateSong,
        deleteSong,
        addEvent,
        updateEvent,
        deleteEvent,
        addNotice,
        updateNotice,
        deleteNotice,
        updateSettings,
        updateEventStatus,
        addChatMessage,
        clearChat,
        markNoticeAsRead,
        markAllNoticesAsRead,
        exportData,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData deve ser usado dentro de DataProvider');
  return context;
};