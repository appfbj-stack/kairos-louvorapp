import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Search, 
  Plus, 
  Trash2, 
  Youtube, 
  Play, 
  BookOpen, 
  Sparkles,
  Music,
  User,
  Heart,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
  CheckCircle,
  FolderOpen,
  FolderHeart,
  FolderPlus,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowLeft,
  Lock,
  ListPlus,
  CheckSquare,
  Square
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

interface VideoLesson {
  id: string;
  title: string;
  channel: string;
  youtubeUrl: string;
  duration: string;
  category: 'Vocal' | 'Teclado' | 'Violão & Guitarra' | 'Baixo' | 'Bateria' | 'Louvor & Ministério';
  description: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  playlistId: string; // Map to a StudyPlaylist
}

interface StudyPlaylist {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
}

const DEFAULT_PLAYLISTS: StudyPlaylist[] = [
  { 
    id: 'p1', 
    name: 'Vocal: Backing Vocal & Harmonia', 
    description: 'Aprenda a fazer segunda voz, aberturas harmônicas e dinâmicas vocais de sustentação e afinação.', 
    category: 'Vocal', 
    difficulty: 'Intermediário' 
  },
  { 
    id: 'p2', 
    name: 'Teclado: Harmonia & Ambientação', 
    description: 'Dominando pads de cobertura, dedilhados de oração, transições suaves e atmosfera de adoração.', 
    category: 'Teclado', 
    difficulty: 'Intermediário' 
  },
  { 
    id: 'p3', 
    name: 'Ritmo: Condução Coesa de Baixo & Bateria', 
    description: 'Trabalhe a sintonia perfeita da cozinha rítmica do louvor contemporâneo e worship dinâmico.', 
    category: 'Ritmo', 
    difficulty: 'Avançado' 
  },
  { 
    id: 'p4', 
    name: 'Ministério: Postura & Condução Espiritual', 
    description: 'A postura do ministro, preparação espiritual e condução profética do altar no culto.', 
    category: 'Louvor & Ministério', 
    difficulty: 'Iniciante' 
  },
  { 
    id: 'p5', 
    name: 'Cordas: Fundamentos de Violão & Guitarra', 
    description: 'Padrões rítmicos, dedilhados e controle de dinâmica instrumental essenciais para a banda.', 
    category: 'Violão & Guitarra', 
    difficulty: 'Iniciante' 
  }
];

const DEFAULT_VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'l1',
    title: 'Como Fazer Segunda Voz e Backing Vocal no Louvor',
    channel: 'Canal de Canto Ministerial',
    youtubeUrl: 'https://www.youtube.com/watch?v=N1e_n00wWkE',
    duration: '15 min',
    category: 'Vocal',
    description: 'Guia prático para vocalistas e backing vocals de ministérios de louvor aprenderem a fazer aberturas de vozes e criar harmonias de forma simples e natural.',
    difficulty: 'Intermediário',
    playlistId: 'p1'
  },
  {
    id: 'l2',
    title: 'Técnicas de Teclado para Ministério de Louvor',
    channel: 'Teclado e Adoração',
    youtubeUrl: 'https://www.youtube.com/watch?v=jU-u8R9I7YQ',
    duration: '18 min',
    category: 'Teclado',
    description: 'Como tocar pads de cobertura, dedilhados suaves para momentos de oração, transições e condução de louvores com sensibilidade.',
    difficulty: 'Intermediário',
    playlistId: 'p2'
  },
  {
    id: 'l3',
    title: 'Guia de Violão no Louvor: Levadas, Dedilhados e Dinâmica',
    channel: 'Escola de Violão no Altar',
    youtubeUrl: 'https://www.youtube.com/watch?v=P_mD6N-pS48',
    duration: '12 min',
    category: 'Violão & Guitarra',
    description: 'Aprenda dinâmicas fundamentais para o violão em uma banda de louvor. Controle de intensidade para crescer junto com a bateria.',
    difficulty: 'Iniciante',
    playlistId: 'p5'
  },
  {
    id: 'l4',
    title: 'Postura Espiritual e Técnica do Ministro de Louvor',
    channel: 'Liderança e Adoração',
    youtubeUrl: 'https://www.youtube.com/watch?v=FjIu0ZAnV1g',
    duration: '22 min',
    category: 'Louvor & Ministério',
    description: 'Uma reflexão essencial sobre vida devocional, postura no altar, sintonia com os pastores da igreja e a importância do preparo técnico aliado à intimidade com Deus.',
    difficulty: 'Iniciante',
    playlistId: 'p4'
  },
  {
    id: 'l5',
    title: 'Tocando Baixo no Louvor - Condução e Groove Minimalista',
    channel: 'Baixistas do Louvor',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZfM_C-eY_o4',
    duration: '14 min',
    category: 'Baixo',
    description: 'O papel do baixo no louvor contemporâneo. Foco em precisão rítmica com o bumbo, marcações sólidas de notas fundamentais e preenchimento harmônico sem exagerar.',
    difficulty: 'Intermediário',
    playlistId: 'p3'
  },
  {
    id: 'l6',
    title: 'Dinâmica de Bateria para Música de Adoração (Worship)',
    channel: 'Bateras Worship Brasil',
    youtubeUrl: 'https://www.youtube.com/watch?v=9_Hk-4S0Xsc',
    duration: '16 min',
    category: 'Bateria',
    description: 'Como conduzir um louvor "worship" crescente na bateria: pratos de efeito (sizzle/shimmer), condução suave no aro nos primeiros versos e viradas expressivas no refrão.',
    difficulty: 'Avançado',
    playlistId: 'p3'
  },
  {
    id: 'l7',
    title: 'Aprenda a Ensaiar sua Música Preferida de Forma Fácil',
    channel: 'Dica Musical com Aline Santana',
    youtubeUrl: 'https://www.youtube.com/watch?v=A6vtJa-NWos',
    duration: '11 min',
    category: 'Louvor & Ministério',
    description: 'Um guia prático apresentado por Aline Santana para aprender a ensaiar suas músicas favoritas com facilidade. Ideal para integrantes do ministério dividirem as partes de forma lógica, analisarem a estrutura harmônica e otimizarem o tempo de ensaio individual e em grupo.',
    difficulty: 'Iniciante',
    playlistId: 'p4'
  }
];

// Extract YouTube ID from URL
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
    if (urlObj.hostname.includes('youtu.be')) {
      const v = urlObj.pathname.substring(1);
      if (v && v.length === 11) return v;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export const VideoLessons: React.FC = () => {
  const { users, currentUserId } = useData();
  const currentUser = users.find(u => u.id === currentUserId);
  const isLeader = currentUser?.role === UserRole.LEADER;

  // Tabs structure: 'all' (Todas as Aulas) | 'playlists' (Playlists de Estudo)
  const [activeTab, setActiveTab] = useState<'all' | 'playlists'>('playlists');

  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [playlists, setPlaylists] = useState<StudyPlaylist[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [playlistLastAccess, setPlaylistLastAccess] = useState<Record<string, string>>({});
  
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Lesson Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newCategory, setNewCategory] = useState<VideoLesson['category']>('Vocal');
  const [newDifficulty, setNewDifficulty] = useState<VideoLesson['difficulty']>('Iniciante');
  const [newPlaylistId, setNewPlaylistId] = useState<string>('');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Playlist Form State
  const [showAddPlaylistForm, setShowAddPlaylistForm] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [playlistCat, setPlaylistCat] = useState('');
  const [playlistDiff, setPlaylistDiff] = useState<StudyPlaylist['difficulty']>('Iniciante');
  const [playlistError, setPlaylistError] = useState('');

  // Load state on mount
  useEffect(() => {
    // 1. Lessons
    const savedLessons = localStorage.getItem('louvor_video_lessons');
    let loadedLessons: VideoLesson[] = [];
    if (savedLessons) {
      try {
        loadedLessons = JSON.parse(savedLessons);
        if (!Array.isArray(loadedLessons)) {
          loadedLessons = DEFAULT_VIDEO_LESSONS;
        } else {
          // Check if default lessons are present, have correct playlistId and valid YouTube URL
          let mutated = false;
          DEFAULT_VIDEO_LESSONS.forEach(def => {
            const index = loadedLessons.findIndex(l => l.id === def.id || l.title === def.title);
            if (index === -1) {
              loadedLessons.push(def);
              mutated = true;
            } else {
              if (!loadedLessons[index].playlistId && def.playlistId) {
                loadedLessons[index].playlistId = def.playlistId;
                mutated = true;
              }
              if (!loadedLessons[index].youtubeUrl) {
                loadedLessons[index].youtubeUrl = def.youtubeUrl;
                mutated = true;
              }
            }
          });
          if (mutated) {
            localStorage.setItem('louvor_video_lessons', JSON.stringify(loadedLessons));
          }
        }
      } catch (e) {
        loadedLessons = DEFAULT_VIDEO_LESSONS;
      }
    } else {
      loadedLessons = DEFAULT_VIDEO_LESSONS;
      localStorage.setItem('louvor_video_lessons', JSON.stringify(DEFAULT_VIDEO_LESSONS));
    }
    setLessons(loadedLessons);

    // 2. Playlists
    const savedPlaylists = localStorage.getItem('louvor_study_playlists');
    let loadedPlaylists: StudyPlaylist[] = [];
    if (savedPlaylists) {
      try {
        loadedPlaylists = JSON.parse(savedPlaylists);
        if (!Array.isArray(loadedPlaylists)) {
          loadedPlaylists = DEFAULT_PLAYLISTS;
        } else {
          let mutated = false;
          DEFAULT_PLAYLISTS.forEach(def => {
            if (!loadedPlaylists.some(p => p.id === def.id)) {
              loadedPlaylists.push(def);
              mutated = true;
            }
          });
          if (mutated) {
            localStorage.setItem('louvor_study_playlists', JSON.stringify(loadedPlaylists));
          }
        }
      } catch (e) {
        loadedPlaylists = DEFAULT_PLAYLISTS;
      }
    } else {
      loadedPlaylists = DEFAULT_PLAYLISTS;
      localStorage.setItem('louvor_study_playlists', JSON.stringify(DEFAULT_PLAYLISTS));
    }
    setPlaylists(loadedPlaylists);

    // Set initial form states
    if (loadedPlaylists.length > 0) {
      setNewPlaylistId(loadedPlaylists[0].id);
    }

    // 3. Completions
    const completionsKey = currentUserId ? `louvor_completed_video_lessons_${currentUserId}` : 'louvor_completed_video_lessons';
    const savedCompletions = localStorage.getItem(completionsKey) || localStorage.getItem('louvor_completed_video_lessons');
    if (savedCompletions) {
      try {
        setCompletedLessonIds(JSON.parse(savedCompletions));
      } catch (e) {
        setCompletedLessonIds([]);
      }
    }

    // 4. Playlist Last Access
    const savedAccess = localStorage.getItem('louvor_playlist_last_access');
    if (savedAccess) {
      try {
        setPlaylistLastAccess(JSON.parse(savedAccess));
      } catch (e) {
        setPlaylistLastAccess({});
      }
    } else {
      // Setup default accesses for sample playlists (e.g. p1 accessed 4 days ago, p3 accessed 5 days ago to trigger initial alerts)
      const initialAccess: Record<string, string> = {};
      const now = new Date();
      
      const d4 = new Date();
      d4.setDate(now.getDate() - 4);
      initialAccess['p1'] = d4.toISOString();

      const d1 = new Date();
      d1.setDate(now.getDate() - 1);
      initialAccess['p2'] = d1.toISOString();

      const d5 = new Date();
      d5.setDate(now.getDate() - 5);
      initialAccess['p3'] = d5.toISOString();

      localStorage.setItem('louvor_playlist_last_access', JSON.stringify(initialAccess));
      setPlaylistLastAccess(initialAccess);
    }

    // Initial selected lesson
    if (loadedLessons.length > 0) {
      setSelectedLesson(loadedLessons[0]);
    }
  }, []);

  const recordPlaylistAccess = (playlistId: string) => {
    if (!playlistId) return;
    const savedAccess = localStorage.getItem('louvor_playlist_last_access');
    let accessMap: Record<string, string> = {};
    if (savedAccess) {
      try {
        accessMap = JSON.parse(savedAccess);
      } catch (e) {
        accessMap = {};
      }
    }
    accessMap[playlistId] = new Date().toISOString();
    localStorage.setItem('louvor_playlist_last_access', JSON.stringify(accessMap));
    setPlaylistLastAccess(accessMap);
  };

  const simulatePlaylistAccess = (playlistId: string, daysAgo: number) => {
    if (!playlistId) return;
    const savedAccess = localStorage.getItem('louvor_playlist_last_access');
    let accessMap: Record<string, string> = {};
    if (savedAccess) {
      try {
        accessMap = JSON.parse(savedAccess);
      } catch (e) {
        accessMap = {};
      }
    }
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    accessMap[playlistId] = d.toISOString();
    localStorage.setItem('louvor_playlist_last_access', JSON.stringify(accessMap));
    setPlaylistLastAccess(accessMap);
  };

  const getPlaylistAccessInfo = (playlistId: string) => {
    const lastAccessStr = playlistLastAccess[playlistId];
    if (!lastAccessStr) {
      return { 
        lastAccessDate: null, 
        daysSince: null, 
        isOverdue: true, 
        statusText: 'Nunca acessada' 
      };
    }
    
    const lastAccessDate = new Date(lastAccessStr);
    const now = new Date();
    const diffTime = now.getTime() - lastAccessDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      lastAccessDate,
      daysSince: diffDays,
      isOverdue: diffDays >= 3,
      statusText: diffDays <= 0 
        ? 'Acessada hoje' 
        : diffDays === 1 
        ? 'Acessada ontem' 
        : `Acessada há ${diffDays} dias`
    };
  };

  const saveLessons = (updated: VideoLesson[]) => {
    setLessons(updated);
    localStorage.setItem('louvor_video_lessons', JSON.stringify(updated));
  };

  const savePlaylists = (updated: StudyPlaylist[]) => {
    setPlaylists(updated);
    localStorage.setItem('louvor_study_playlists', JSON.stringify(updated));
  };

  const toggleLessonCompletion = (lessonId: string) => {
    let updated: string[];
    if (completedLessonIds.includes(lessonId)) {
      updated = completedLessonIds.filter(id => id !== lessonId);
    } else {
      updated = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updated);
    const completionsKey = currentUserId ? `louvor_completed_video_lessons_${currentUserId}` : 'louvor_completed_video_lessons';
    localStorage.setItem(completionsKey, JSON.stringify(updated));
    // Also save a fallback for migration if needed
    localStorage.setItem('louvor_completed_video_lessons', JSON.stringify(updated));

    // Update playlist last accessed timestamp
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson && lesson.playlistId) {
      recordPlaylistAccess(lesson.playlistId);
    }
  };

  const handleAddPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistError('');

    if (!playlistName) {
      setPlaylistError('Por favor, digite o nome da playlist.');
      return;
    }

    const newPlaylist: StudyPlaylist = {
      id: 'p_' + Date.now(),
      name: playlistName,
      description: playlistDesc || 'Playlist de Estudos Ministerial.',
      category: playlistCat || 'Geral',
      difficulty: playlistDiff
    };

    const updated = [...playlists, newPlaylist];
    savePlaylists(updated);

    // Reset Form
    setPlaylistName('');
    setPlaylistDesc('');
    setPlaylistCat('');
    setPlaylistDiff('Iniciante');
    setShowAddPlaylistForm(false);
    
    // Select this playlist in lesson form automatically
    setNewPlaylistId(newPlaylist.id);
  };

  const handleDeletePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir esta playlist? As aulas associadas voltarão a ficar sem playlist.')) {
      const updated = playlists.filter(p => p.id !== id);
      savePlaylists(updated);

      // Reset lessons associated with this playlist
      const updatedLessons = lessons.map(lesson => {
        if (lesson.playlistId === id) {
          return { ...lesson, playlistId: '' };
        }
        return lesson;
      });
      saveLessons(updatedLessons);

      if (selectedPlaylistId === id) {
        setSelectedPlaylistId(null);
      }
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle || !newUrl) {
      setFormError('Por favor, preencha o título e insira o link do YouTube.');
      return;
    }

    const videoId = getYouTubeId(newUrl);
    if (!videoId) {
      setFormError('Link do YouTube inválido. Exemplo: https://www.youtube.com/watch?v=... ou https://youtu.be/...');
      return;
    }

    const newLesson: VideoLesson = {
      id: 'lesson_' + Date.now(),
      title: newTitle,
      channel: newChannel || 'Ministério de Louvor',
      youtubeUrl: newUrl,
      duration: newDuration || '10 min',
      category: newCategory,
      difficulty: newDifficulty,
      playlistId: newPlaylistId || '',
      description: newDescription || 'Nenhuma descrição detalhada.'
    };

    const updated = [newLesson, ...lessons];
    saveLessons(updated);
    setSelectedLesson(newLesson);

    // Reset Lesson Form
    setNewTitle('');
    setNewChannel('');
    setNewUrl('');
    setNewDuration('');
    setNewDescription('');
    setShowAddForm(false);
  };

  const handleDeleteLesson = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja realmente remover esta vídeo-aula?')) {
      const updated = lessons.filter(l => l.id !== id);
      saveLessons(updated);
      
      if (selectedLesson?.id === id) {
        setSelectedLesson(updated.length > 0 ? updated[0] : null);
      }
    }
  };

  const categories = ['Todas', 'Vocal', 'Teclado', 'Violão & Guitarra', 'Baixo', 'Bateria', 'Louvor & Ministério'];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lesson.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || lesson.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculations for progress
  const getPlaylistProgress = (playlistId: string) => {
    const playlistLessons = lessons.filter(l => l.playlistId === playlistId);
    if (playlistLessons.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = playlistLessons.filter(l => completedLessonIds.includes(l.id)).length;
    return {
      completed,
      total: playlistLessons.length,
      percentage: Math.round((completed / playlistLessons.length) * 100)
    };
  };

  const getDifficultyColor = (diff: 'Iniciante' | 'Intermediário' | 'Avançado') => {
    switch (diff) {
      case 'Iniciante': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Intermediário': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Avançado': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  // Overall Global Progress
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.filter(id => lessons.some(l => l.id === id)).length;
  const overallPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const overduePlaylists = playlists.filter(p => {
    const info = getPlaylistAccessInfo(p.id);
    return info.isOverdue;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
            <Tv className="text-blue-600" size={32} /> Vídeo-Aulas & Playlists de Estudo
          </h2>
          <p className="text-slate-500 font-medium">
            Capacitação ministerial organizada por níveis e temas com acompanhamento de progresso.
          </p>
        </div>
        
        {/* View Switcher Controls */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 self-start md:self-auto border border-slate-200/50 shadow-sm">
          <button
            onClick={() => {
              setActiveTab('playlists');
              setSelectedPlaylistId(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'playlists'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderHeart size={14} /> Playlists de Estudo
          </button>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedPlaylistId(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Music size={14} /> Todas as Aulas ({lessons.length})
          </button>
        </div>
      </header>

      {/* OVERALL PROGRESS CARD (Always visible to motivate the student) */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/80 border border-blue-100/50 rounded-[2.5rem] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-md shadow-blue-100/80 hidden sm:block">
            <Award size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Seu Progresso de Aprendizado</h3>
            <p className="text-slate-500 text-xs font-medium">Continue assistindo e conclua as aulas para elevar o nível musical do altar.</p>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700 px-1">
            <span className="flex items-center gap-1">
              <CheckCircle size={14} className="text-blue-600" />
              {completedCount} de {totalLessons} aulas concluídas
            </span>
            <span>{overallPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200/60 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* LEADERS CONTROLS FLOATING BAR */}
      {isLeader && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-1">
            <Sparkles size={12} className="text-blue-500" /> Painel do Líder:
          </span>
          
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowAddPlaylistForm(false);
            }}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Plus size={14} /> Cadastrar Nova Aula
          </button>

          <button
            onClick={() => {
              setShowAddPlaylistForm(!showAddPlaylistForm);
              setShowAddForm(false);
            }}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <FolderPlus size={14} className="text-slate-500" /> Criar Playlist de Estudo
          </button>
        </div>
      )}

      {/* FORM MODALS INLINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Add Lesson Form */}
        {showAddForm && (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-4 md:col-span-2 animate-in slide-in-from-top-6 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Tv size={18} className="text-blue-600" /> Nova Vídeo-Aula
              </h4>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-lg"
              >
                Cancelar
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-1.5 p-3 bg-red-50 text-red-700 rounded-2xl text-[11px]">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddLesson} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Título do Vídeo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Técnicas de Pedal de Expressão"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Canal / Autor</label>
                <input
                  type="text"
                  placeholder="Ex: Escola de Música Louvor"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newChannel}
                  onChange={e => setNewChannel(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Duração aproximada</label>
                <input
                  type="text"
                  placeholder="Ex: 15 min"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Instrumento / Categoria</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                >
                  <option value="Vocal">Vocal</option>
                  <option value="Teclado">Teclado</option>
                  <option value="Violão & Guitarra">Violão & Guitarra</option>
                  <option value="Baixo">Baixo</option>
                  <option value="Bateria">Bateria</option>
                  <option value="Louvor & Ministério">Louvor & Ministério</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nível de Dificuldade</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newDifficulty}
                  onChange={e => setNewDifficulty(e.target.value as any)}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Vincular a uma Playlist</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newPlaylistId}
                  onChange={e => setNewPlaylistId(e.target.value)}
                >
                  <option value="">Nenhuma playlist</option>
                  {playlists.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.difficulty})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Link do Vídeo no YouTube *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição curta</label>
                <textarea
                  rows={2}
                  placeholder="Assuntos e técnicas ensinados..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                />
              </div>

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Salvar Aula no Acervo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. Add Playlist Form */}
        {showAddPlaylistForm && (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-4 md:col-span-2 animate-in slide-in-from-top-6 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FolderPlus size={18} className="text-blue-600" /> Criar Playlist de Estudos
              </h4>
              <button 
                onClick={() => setShowAddPlaylistForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-lg"
              >
                Cancelar
              </button>
            </div>

            {playlistError && (
              <div className="flex items-start gap-1.5 p-3 bg-red-50 text-red-700 rounded-2xl text-[11px]">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{playlistError}</span>
              </div>
            )}

            <form onSubmit={handleAddPlaylist} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nome da Playlist *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teclado Iniciante"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tema / Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Vocal, Guitarra, Cozinha"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={playlistCat}
                  onChange={e => setPlaylistCat(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dificuldade Estimada</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={playlistDiff}
                  onChange={e => setPlaylistDiff(e.target.value as any)}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição / Objetivo do Aprendizado</label>
                <textarea
                  rows={2}
                  placeholder="Descreva o que o aluno dominará após concluir esta trilha..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  value={playlistDesc}
                  onChange={e => setPlaylistDesc(e.target.value)}
                />
              </div>

              <div className="md:col-span-3 pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Criar Playlist
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* VIEW 1: PLAYLISTS OF STUDY */}
      {activeTab === 'playlists' && (
        <div className="space-y-8">
          {/* COURSE VIEW (SPLIT-SCREEN WHEN PLAYLIST SELECTED) */}
          {selectedPlaylistId ? (
            (() => {
              const playlist = playlists.find(p => p.id === selectedPlaylistId);
              const playlistLessons = lessons.filter(l => l.playlistId === selectedPlaylistId);
              
              // Load the first lesson if none selected, or if selected doesn't belong to this playlist
              const currentPlaylistLesson = playlistLessons.find(l => l.id === selectedLesson?.id) || playlistLessons[0];
              const progress = getPlaylistProgress(selectedPlaylistId);

              return (
                <div className="space-y-6">
                  {/* Playlist Header Controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedPlaylistId(null)}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center justify-center border border-slate-200/40"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        Trilha de Estudo: {playlist?.category}
                      </span>
                      <h4 className="text-xl font-bold text-slate-800 leading-snug">{playlist?.name}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Active Player and Status */}
                    <div className="lg:col-span-2 space-y-6">
                      {currentPlaylistLesson ? (
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-5">
                          {/* YouTube Frame */}
                          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-md">
                            {getYouTubeId(currentPlaylistLesson.youtubeUrl) ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeId(currentPlaylistLesson.youtubeUrl)}?autoplay=0`}
                                title={currentPlaylistLesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-900">
                                <span className="font-bold">Vídeo indisponível</span>
                              </div>
                            )}
                          </div>

                          {/* Toggle Completion */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                              {completedLessonIds.includes(currentPlaylistLesson.id) ? (
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                                  <CheckCircle size={20} />
                                </div>
                              ) : (
                                <div className="p-2 bg-slate-200 text-slate-400 rounded-xl">
                                  <Clock size={20} />
                                </div>
                              )}
                              <div>
                                <h5 className="font-bold text-xs text-slate-800">Status de Conclusão</h5>
                                <p className="text-[10px] text-slate-400">Marque para registrar na sua barra de progresso.</p>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleLessonCompletion(currentPlaylistLesson.id)}
                              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                completedLessonIds.includes(currentPlaylistLesson.id)
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-50'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-50'
                              }`}
                            >
                              {completedLessonIds.includes(currentPlaylistLesson.id) ? (
                                <>
                                  <CheckSquare size={14} /> Concluída (Clique para Reverter)
                                </>
                              ) : (
                                <>
                                  <Square size={14} /> Marcar como Concluída
                                </>
                              )}
                            </button>
                          </div>

                          {/* Lesson Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                                {currentPlaylistLesson.category}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-wider border px-3 py-0.5 rounded-lg ${getDifficultyColor(currentPlaylistLesson.difficulty)}`}>
                                {currentPlaylistLesson.difficulty}
                              </span>
                              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                <Clock size={12} /> {currentPlaylistLesson.duration}
                              </span>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
                              {currentPlaylistLesson.title}
                            </h3>
                            <p className="text-slate-400 text-xs font-bold">Canal / Instrutor: <span className="text-slate-600">{currentPlaylistLesson.channel}</span></p>

                            <div className="border-t border-slate-100 pt-4 mt-2">
                              <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Descrição da Aula</h5>
                              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {currentPlaylistLesson.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center h-[350px] flex flex-col items-center justify-center">
                          <Youtube size={48} className="text-slate-300 mb-3" />
                          <h4 className="font-bold text-slate-700">Esta playlist está vazia</h4>
                          <p className="text-slate-400 text-xs mt-1 max-w-sm">Associe vídeo-aulas a esta playlist para começar o estudo.</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Playlist Lessons Progress & Sidebar Navigation */}
                    <div className="space-y-6">
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-5">
                        {/* Playlist Progress Detail */}
                        <div className="space-y-2 pb-4 border-b border-slate-100">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                            <span>Progresso na Playlist</span>
                            <span>{progress.completed}/{progress.total} ({progress.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* List of lessons */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1 mb-3">Aulas da Playlist</h5>
                          
                          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                            {playlistLessons.map((lesson, idx) => {
                              const isCurrent = lesson.id === currentPlaylistLesson?.id;
                              const isCompleted = completedLessonIds.includes(lesson.id);

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`p-3 border rounded-2xl cursor-pointer transition-all group flex items-center justify-between gap-3 ${
                                    isCurrent 
                                      ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm' 
                                      : 'bg-slate-50 border-slate-100/80 hover:bg-white hover:border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                                      isCompleted 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : isCurrent
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-200 text-slate-500'
                                    }`}>
                                      {isCompleted ? <CheckSquare size={14} /> : idx + 1}
                                    </div>

                                    <div className="min-w-0">
                                      <h6 className="font-bold text-xs truncate leading-snug group-hover:text-blue-600">
                                        {lesson.title}
                                      </h6>
                                      <span className="text-[9px] text-slate-400 font-bold">{lesson.duration}</span>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${getDifficultyColor(lesson.difficulty)}`}>
                                      {lesson.difficulty}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {playlistLessons.length === 0 && (
                              <p className="text-center text-slate-400 text-xs py-4">Nenhuma aula nesta playlist.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Course Guidelines */}
                      <div className="bg-gradient-to-tr from-slate-50 to-blue-50/20 border border-slate-100 p-6 rounded-[2.5rem] space-y-3">
                        <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <BookOpen size={14} className="text-blue-600" /> Método de Prática
                        </h5>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Assista ao vídeo sem tocar ou cantar primeiro. Na segunda reprodução, pause em trechos importantes para aplicar o exercício prático no seu instrumento ou voz.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* LIST PLAYLISTS GRID */
            <div className="space-y-6">
              {/* STUDY REMINDER BANNER */}
              {overduePlaylists.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm animate-bounce">
                      <AlertCircle size={22} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Lembrete de Estudo</h4>
                      <p className="text-slate-500 text-xs font-medium">Você tem playlists de estudo sem acesso há mais de 3 dias. Mantenha seu ritmo de aprendizado!</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {overduePlaylists.map(playlist => {
                      const info = getPlaylistAccessInfo(playlist.id);
                      return (
                        <div 
                          key={playlist.id}
                          className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-amber-200 transition-all shadow-xs"
                        >
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-800 truncate">{playlist.name}</h5>
                            <p className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
                              <Clock size={11} /> 
                              {info.daysSince === null ? 'Ainda não iniciada' : `Não acessada há ${info.daysSince} dias`}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedPlaylistId(playlist.id);
                              recordPlaylistAccess(playlist.id);
                              const playlistLessons = lessons.filter(l => l.playlistId === playlist.id);
                              if (playlistLessons.length > 0) {
                                setSelectedLesson(playlistLessons[0]);
                              }
                            }}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shrink-0 transition-colors shadow-xs animate-pulse"
                          >
                            <Play size={10} fill="currentColor" /> Estudar Agora
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TESTING & SIMULATION PANEL */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500" /> Simulador de Acesso (Testar Lembretes)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">Mude o último acesso para disparar ou limpar o alerta de 3 dias</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {playlists.map(p => {
                    const info = getPlaylistAccessInfo(p.id);
                    return (
                      <div key={p.id} className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-xs">
                        <div className="min-w-0">
                          <h6 className="font-bold text-xs text-slate-700 truncate" title={p.name}>
                            {p.name}
                          </h6>
                          <p className="text-[10px] text-slate-400 mt-0.5">{info.statusText}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => simulatePlaylistAccess(p.id, 0)}
                            className="flex-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-md transition-colors"
                            title="Simular acesso hoje"
                          >
                            Hoje
                          </button>
                          <button
                            onClick={() => simulatePlaylistAccess(p.id, 4)}
                            className="flex-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[9px] font-black rounded-md transition-colors"
                            title="Simular acesso há 4 dias (Disparar Alerta)"
                          >
                            4 Dias
                          </button>
                          <button
                            onClick={() => simulatePlaylistAccess(p.id, 10)}
                            className="flex-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9px] font-black rounded-md transition-colors"
                            title="Simular acesso há 10 dias (Disparar Alerta)"
                          >
                            10 Dias
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <FolderOpen size={14} /> Trilhas de Estudo por Instrumento / Nível
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 ml-1">Selecione uma playlist para carregar o modo curso estruturado.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map(playlist => {
                  const progress = getPlaylistProgress(playlist.id);

                  return (
                    <div
                      key={playlist.id}
                      onClick={() => {
                        setSelectedPlaylistId(playlist.id);
                        recordPlaylistAccess(playlist.id);
                        const playlistLessons = lessons.filter(l => l.playlistId === playlist.id);
                        if (playlistLessons.length > 0) {
                          setSelectedLesson(playlistLessons[0]);
                        }
                      }}
                      className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative"
                    >
                      {isLeader && (
                        <button
                          onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                          className="absolute right-6 top-6 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                          title="Excluir Playlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      <div className="space-y-2">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded">
                            {playlist.category}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded ${getDifficultyColor(playlist.difficulty)}`}>
                            {playlist.difficulty}
                          </span>
                          {(() => {
                            const info = getPlaylistAccessInfo(playlist.id);
                            return (
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 ${
                                info.isOverdue 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100 font-bold' 
                                  : 'bg-slate-50 text-slate-500'
                              }`}>
                                <Clock size={10} />
                                {info.statusText}
                                {info.isOverdue && ' ⚠️'}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Name */}
                        <h5 className="font-bold text-base text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                          {playlist.name}
                        </h5>

                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                          {playlist.description}
                        </p>
                      </div>

                      {/* Progress representation */}
                      <div className="space-y-2 pt-4 border-t border-slate-50">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {progress.total} aulas disponíveis
                          </span>
                          <span>{progress.percentage}% concluído</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ALL VIDEO LESSONS (TRADITIONAL GRID LIST) */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Player / Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {selectedLesson ? (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm p-6 sm:p-8 space-y-5">
                {/* YouTube Embed Frame */}
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-md">
                  {getYouTubeId(selectedLesson.youtubeUrl) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(selectedLesson.youtubeUrl)}?autoplay=0`}
                      title={selectedLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-900">
                      <span className="font-bold">Vídeo não pôde ser carregado</span>
                    </div>
                  )}
                </div>

                {/* Completion Switch in Player */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    {completedLessonIds.includes(selectedLesson.id) ? (
                      <CheckSquare className="text-emerald-600" size={18} />
                    ) : (
                      <Square className="text-slate-400" size={18} />
                    )}
                    <span className="text-xs font-bold text-slate-700">Registrar como assistido nesta sessão?</span>
                  </div>
                  <button
                    onClick={() => toggleLessonCompletion(selectedLesson.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      completedLessonIds.includes(selectedLesson.id)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {completedLessonIds.includes(selectedLesson.id) ? '✓ Aula Concluída' : 'Concluir Aula'}
                  </button>
                </div>

                {/* Lesson details info */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                      {selectedLesson.category}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-lg border ${getDifficultyColor(selectedLesson.difficulty)}`}>
                      {selectedLesson.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
                      <Clock size={12} /> {selectedLesson.duration}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">{selectedLesson.title}</h3>
                  <p className="text-slate-400 text-xs font-bold">Canal / Autor: <span className="text-slate-600">{selectedLesson.channel}</span></p>
                  
                  <div className="border-t border-slate-50 pt-4 mt-2">
                    <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Sobre esta aula</h5>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedLesson.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center h-[350px] flex flex-col items-center justify-center">
                <Youtube size={48} className="text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-700">Nenhuma vídeo-aula disponível</h4>
                <p className="text-slate-400 text-xs mt-1 max-w-sm">Selecione um dos filtros de busca ou crie uma nova aula com sua conta líder.</p>
              </div>
            )}
          </div>

          {/* Right Column: Search, Filter & Lesson List */}
          <div className="space-y-6">
            {/* Search and Category Filters */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar vídeo-aula..."
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Horizontal Filter chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lesson List Container */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-3">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">
                Aulas Disponíveis ({filteredLessons.length})
              </h4>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                {filteredLessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-3.5 border rounded-2xl cursor-pointer transition-all group relative flex gap-3.5 items-center ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-blue-50/50 border-blue-200 text-blue-900 shadow-sm'
                        : 'bg-slate-50/60 border-slate-100 hover:bg-white hover:border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      completedLessonIds.includes(lesson.id)
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedLesson?.id === lesson.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {completedLessonIds.includes(lesson.id) ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Youtube size={18} />
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                          {lesson.category}
                        </span>
                        <span className={`text-[7px] font-black uppercase tracking-wider px-1 rounded ${getDifficultyColor(lesson.difficulty)}`}>
                          {lesson.difficulty}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs leading-snug truncate group-hover:text-blue-600 mt-0.5">
                        {lesson.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                        {lesson.channel} • {lesson.duration}
                      </p>
                    </div>

                    {isLeader && (
                      <button
                        onClick={(e) => handleDeleteLesson(lesson.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all absolute right-2 top-1/2 -translate-y-1/2"
                        title="Excluir aula"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {filteredLessons.length === 0 && (
                  <p className="text-center text-slate-400 text-xs py-6">Nenhum resultado para os filtros atuais.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default VideoLessons;
