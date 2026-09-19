
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Song, Event, Notice, MinistrySettings, ChatMessage, UserRole } from '../types';
import { MOCK_USERS, MOCK_SONGS, MOCK_EVENTS, MOCK_NOTICES } from '../constants';

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
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addSong: (song: Song) => void;
  updateSong: (song: Song) => void;
  addEvent: (event: Event) => void;
  addNotice: (notice: Notice) => void;
  updateSettings: (settings: MinistrySettings) => void;
  updateEventStatus: (eventId: string, userId: string, status: any) => void;
  addChatMessage: (content: string) => void;
  clearChat: () => void;
  markNoticeAsRead: (id: string) => void;
  markAllNoticesAsRead: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const DEFAULT_SETTINGS: MinistrySettings = {
  name: 'Kairos louvor',
  churchName: 'Igreja Local',
  youtubeChannel: '',
  driveFolder: '',
  spotifyPlaylist: '',
  instagram: '',
  allowMemberChat: true,
  allowMemberNotices: true,
  confirmationDeadlineDays: 3,
  enableVocalTraining: true,
  enableVideoLessons: true
};

const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: '1',
    senderName: 'André Silva',
    senderRole: UserRole.LEADER,
    senderFunction: 'Líder / Violão',
    content: 'Olá pessoal! Sejam bem-vindos ao chat do nosso ministério de louvor. Vamos usar este espaço para alinhar ensaios, tirar dúvidas de cifras e compartilhar devocionais. 🙏',
    timestamp: '2026-07-03T18:00:00Z'
  },
  {
    id: 'm2',
    senderId: '2',
    senderName: 'Juliana Costa',
    senderRole: UserRole.MEMBER,
    senderFunction: 'Voz / Backing',
    content: 'Que bênção! Estava mesmo precisando de um canal rápido para falar com vocês. André, o tom de "A Casa é Sua" vai ser em Lá (A) mesmo no domingo?',
    timestamp: '2026-07-03T18:15:00Z'
  },
  {
    id: 'm3',
    senderId: '1',
    senderName: 'André Silva',
    senderRole: UserRole.LEADER,
    senderFunction: 'Líder / Violão',
    content: 'Isso, Ju! Mantivemos em Lá (A) para ficar confortável para a sua voz e para a congregação acompanhar de forma espontânea.',
    timestamp: '2026-07-03T18:20:00Z'
  },
  {
    id: 'm4',
    senderId: '3',
    senderName: 'Ricardo Santos',
    senderRole: UserRole.MEMBER,
    senderFunction: 'Bateria',
    content: 'Fechado! No ensaio de ontem achei que a transição de bateria no final ficou excelente. Prontos para domingo!',
    timestamp: '2026-07-03T19:30:00Z'
  },
  {
    id: 'm5',
    senderId: '4',
    senderName: 'Mariana Lima',
    senderRole: UserRole.MEMBER,
    senderFunction: 'Teclado',
    content: 'Amém! Vou repassar os arranjos de teclado hoje à noite. Se alguém tiver alguma dúvida de harmonia, me avisem.',
    timestamp: '2026-07-03T19:45:00Z'
  }
];


const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(localStorage.getItem('louvor_current_user_id'));

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('louvor_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('louvor_songs');
    if (saved) {
      try {
        const parsed: Song[] = JSON.parse(saved);
        // Migração: garantir que toda música tenha o campo arrangement
        const migrated: Song[] = parsed.map(s => ({ ...s, arrangement: s.arrangement || '' }));

        // Migração avançada: detectar se os MOCK_SONGS do bundle são mais novos
        // que os do localStorage e sincronizar.
        // - Para MOCKs conhecidos com cifras novas: atualiza a letra e o arranjo.
        // - Para MOCKs novos (que não existem no localStorage): adiciona a partir do bundle.
        const knownIds = new Set(migrated.map(s => s.id));

        // 1. Atualiza MOCKs existentes que ganharam cifras/arranjo
        const syncedExisting: Song[] = migrated.map(s => {
          const newMock = MOCK_SONGS.find(m => m.id === s.id);
          if (newMock) {
            const oldHasChords = /\[[A-G][#b]?[^]]*\]/.test(s.lyrics || '');
            const newHasChords = /\[[A-G][#b]?[^]]*\]/.test(newMock.lyrics || '');
            const needsUpdate = !oldHasChords && newHasChords;
            const hasNoArrangement = !s.arrangement || s.arrangement.trim() === '';
            if (needsUpdate || hasNoArrangement) {
              return {
                ...s,
                lyrics: newMock.lyrics,
                arrangement: newMock.arrangement || s.arrangement || '',
              };
            }
          }
          return s;
        });

        // 2. Adiciona MOCKs novos que ainda não existem no localStorage
        const newMocks: Song[] = MOCK_SONGS
          .filter(m => !knownIds.has(m.id))
          .map(m => ({ ...m, arrangement: m.arrangement || '' }));

        return [...newMocks, ...syncedExisting];
      } catch (e) {
        return MOCK_SONGS;
      }
    }
    return MOCK_SONGS;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('louvor_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length <= 2 || !parsed.some((e: any) => e.id.startsWith('gen_e_'))) {
          return MOCK_EVENTS;
        }
        return parsed;
      } catch (e) {
        return MOCK_EVENTS;
      }
    }
    return MOCK_EVENTS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('louvor_notices');
    return saved ? JSON.parse(saved) : MOCK_NOTICES;
  });

  const [settings, setSettings] = useState<MinistrySettings>(() => {
    const saved = localStorage.getItem('louvor_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('louvor_chat_messages');
    return saved ? JSON.parse(saved) : DEFAULT_CHAT_MESSAGES;
  });

  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('louvor_read_notice_ids');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem('louvor_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('louvor_songs', JSON.stringify(songs)), [songs]);
  useEffect(() => localStorage.setItem('louvor_events', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('louvor_notices', JSON.stringify(notices)), [notices]);
  useEffect(() => localStorage.setItem('louvor_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('louvor_chat_messages', JSON.stringify(chatMessages)), [chatMessages]);
  useEffect(() => localStorage.setItem('louvor_read_notice_ids', JSON.stringify(readNoticeIds)), [readNoticeIds]);
  useEffect(() => {
    if (currentUserId) localStorage.setItem('louvor_current_user_id', currentUserId);
    else localStorage.removeItem('louvor_current_user_id');
  }, [currentUserId]);

  const addUser = (user: User) => setUsers([user, ...users]);
  const updateUser = (updatedUser: User) => setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  const deleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));
  const addSong = (song: Song) => setSongs([song, ...songs]);
  const updateSong = (updatedSong: Song) => setSongs(songs.map(s => s.id === updatedSong.id ? updatedSong : s));
  const addEvent = (event: Event) => setEvents([event, ...events]);
  const addNotice = (notice: Notice) => {
    let updated = [...notices];
    if (notice.isPinned) updated = updated.map(n => ({ ...n, isPinned: false }));
    setNotices([notice, ...updated]);
  };
  const updateSettings = (newSettings: MinistrySettings) => setSettings(newSettings);

  const markNoticeAsRead = (id: string) => {
    if (!readNoticeIds.includes(id)) {
      setReadNoticeIds(prev => [...prev, id]);
    }
  };

  const markAllNoticesAsRead = () => {
    const allIds = notices.map(n => n.id);
    setReadNoticeIds(allIds);
  };

  const addChatMessage = (content: string) => {
    if (!currentUserId) return;
    const currentUser = users.find(u => u.id === currentUserId);
    if (!currentUser) return;

    const newMessage: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderFunction: currentUser.function,
      content,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMessage]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const updateEventStatus = (eventId: string, userId: string, status: any) => {

    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          scale: event.scale.map(s => s.userId === userId ? { ...s, status } : s)
        };
      }
      return event;
    }));
  };

  const exportData = () => {
    const data = { users, songs, events, notices, settings };
    return JSON.stringify(data, null, 2);
  };

  const importData = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.users) setUsers(data.users);
      if (data.songs) setSongs(data.songs);
      if (data.events) setEvents(data.events);
      if (data.notices) setNotices(data.notices);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error("Erro ao importar dados", e);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{ 
      users, songs, events, notices, settings, chatMessages, readNoticeIds, currentUserId, setCurrentUserId,
      addUser, updateUser, deleteUser, addSong, updateSong, addEvent, addNotice, updateSettings,
      updateEventStatus, addChatMessage, clearChat, markNoticeAsRead, markAllNoticesAsRead, exportData, importData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
