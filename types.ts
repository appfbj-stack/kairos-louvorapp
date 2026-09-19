
export enum UserRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  function: string; // e.g., 'Teclado', 'Voz', 'Guitarra'
  instrument: string;
  phone: string;
}

export enum EventType {
  SERVICE = 'CULTO',
  REHEARSAL = 'ENSAIO',
  SPECIAL = 'ESPECIAL'
}

export enum PresenceStatus {
  PENDING = 'PENDENTE',
  CONFIRMED = 'CONFIRMADO',
  DECLINED = 'RECUSADO'
}

export interface ScaleEntry {
  userId: string;
  userName: string;
  function: string;
  status: PresenceStatus;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  observations: string;
  scale: ScaleEntry[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string; // Tom oficial
  /**
   * Letra com cifras no formato ChordPro: ex. "[C]Te amo Deus, [G]Tua graça nunca falha".
   * O renderer posiciona a cifra acima da sílaba correspondente.
   * Suporta quebras de linha duplas para novas estrofes/seções ([Intro], [Verso 1], [Refrão], [Ponte]).
   */
  lyrics: string;
  /**
   * Arranjo / notas ministeriais (markdown leve).
   * Suporta seções com prefixo ##: "## Intro", "## Verso 1", "## Refrão", "## Ponte", "## Final".
   * Cada seção pode ter bullet points com instruções de execução.
   */
  arrangement?: string;
  chordsUrl?: string;
  youtubeUrl?: string;
  driveUrl?: string;
  audioUrl?: string; // Link de áudio de referência (Nuvem, MP3, etc.)
}

export interface MinistrySettings {
  name: string;
  churchName: string;
  youtubeChannel?: string;
  driveFolder?: string;
  spotifyPlaylist?: string;
  instagram?: string;
  allowMemberChat?: boolean;
  allowMemberNotices?: boolean;
  confirmationDeadlineDays?: number;
  enableVocalTraining?: boolean;
  enableVideoLessons?: boolean;
}

export interface Setlist {
  id: string;
  eventId: string;
  songIds: string[];
  spiritualNote?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
  authorName: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderFunction: string;
  content: string;
  timestamp: string;
}

