
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  Pin, 
  Sparkles, 
  Check, 
  X, 
  Music, 
  Clock, 
  MapPin,
  RefreshCw,
  Youtube,
  FileText,
  Mic2,
  Copy,
  ListMusic,
  Globe,
  Instagram,
  MessageSquare,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PresenceStatus, Song, Notice, EventType } from '../types';
import { GeminiService } from '../services/geminiService';
import { useData } from '../context/DataContext';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  targetType: 'video_lessons' | 'rehearsal_attendance' | 'service_attendance' | 'custom';
  targetValue: number;
  targetYear: number;
  assignedUserId: string;
  createdDate: string;
}

const DEFAULT_GOALS: GrowthGoal[] = [
  {
    id: 'g1',
    title: 'Capacitação e Vídeo-Aulas',
    description: 'Completar pelo menos 6 vídeo-aulas da aba "Vídeo-Aulas" ou de playlists ministeriais para aprimorar a técnica do seu instrumento.',
    targetType: 'video_lessons',
    targetValue: 6,
    targetYear: 2026,
    assignedUserId: 'all',
    createdDate: '2026-01-01T00:00:00Z'
  },
  {
    id: 'g2',
    title: 'Compromisso com os Ensaios',
    description: 'Manter presença de no mínimo 80% nos ensaios escalados para garantir o alinhamento musical do grupo.',
    targetType: 'rehearsal_attendance',
    targetValue: 80,
    targetYear: 2026,
    assignedUserId: 'all',
    createdDate: '2026-01-01T00:00:00Z'
  },
  {
    id: 'g3',
    title: 'Fidelidade nas Escalas de Culto',
    description: 'Manter presença de no mínimo 85% nos cultos onde você estiver escalado(a).',
    targetType: 'service_attendance',
    targetValue: 85,
    targetYear: 2026,
    assignedUserId: 'all',
    createdDate: '2026-01-01T00:00:00Z'
  },
  {
    id: 'g4',
    title: 'Estudo Técnico Individual',
    description: 'Praticar o repertório de domingo de forma individual antes do ensaio geral do ministério.',
    targetType: 'custom',
    targetValue: 1,
    targetYear: 2026,
    assignedUserId: 'all',
    createdDate: '2026-01-01T00:00:00Z'
  }
];

const getYearlyUserStats = (userId: string, events: any[]) => {
  const today = new Date();
  const limitYearDate = new Date();
  limitYearDate.setDate(today.getDate() - 365);
  const yearlyEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= limitYearDate && eventDate <= today;
  });

  const userEvents = yearlyEvents.filter(event => 
    event.scale.some(s => s.userId === userId)
  );

  const scheduledRehearsals = userEvents.filter(e => e.type === EventType.REHEARSAL).length;
  const attendedRehearsals = userEvents.filter(e => 
    e.type === EventType.REHEARSAL && e.scale.some(s => s.userId === userId && s.status === PresenceStatus.CONFIRMED)
  ).length;

  const scheduledServices = userEvents.filter(e => e.type === EventType.SERVICE).length;
  const attendedServices = userEvents.filter(e => 
    e.type === EventType.SERVICE && e.scale.some(s => s.userId === userId && s.status === PresenceStatus.CONFIRMED)
  ).length;

  const rehearsalPresenceRate = scheduledRehearsals > 0 ? Math.round((attendedRehearsals / scheduledRehearsals) * 100) : 0;
  const servicePresenceRate = scheduledServices > 0 ? Math.round((attendedServices / scheduledServices) * 100) : 0;

  return {
    rehearsalPresenceRate,
    servicePresenceRate
  };
};

const Dashboard: React.FC = () => {
  const { events, songs, notices, settings, updateEventStatus, currentUserId, users, chatMessages, readNoticeIds } = useData();
  const currentUser = users.find(u => u.id === currentUserId);
  
  const [goals, setGoals] = useState<GrowthGoal[]>(() => {
    const saved = localStorage.getItem('louvor_yearly_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_GOALS;
  });

  const getGoalProgress = (goal: GrowthGoal, userId: string) => {
    if (goal.targetType === 'custom') {
      const customCompletions = JSON.parse(localStorage.getItem(`louvor_custom_goal_completions_${userId}`) || '{}');
      return {
        current: customCompletions[goal.id] ? 1 : 0,
        percentage: customCompletions[goal.id] ? 100 : 0,
        isCompleted: !!customCompletions[goal.id],
        label: customCompletions[goal.id] ? 'Concluída' : 'Pendente'
      };
    }

    if (goal.targetType === 'video_lessons') {
      const completionsKey = `louvor_completed_video_lessons_${userId}`;
      const savedCompletions = localStorage.getItem(completionsKey) || localStorage.getItem('louvor_completed_video_lessons') || '[]';
      let completedCount = 0;
      try {
        completedCount = JSON.parse(savedCompletions).length;
      } catch (e) {}

      const percentage = Math.min(100, Math.round((completedCount / goal.targetValue) * 100));
      return {
        current: completedCount,
        percentage,
        isCompleted: completedCount >= goal.targetValue,
        label: `${completedCount} de ${goal.targetValue} aulas`
      };
    }

    const yearlyStats = getYearlyUserStats(userId, events);

    if (goal.targetType === 'rehearsal_attendance') {
      const rate = yearlyStats.rehearsalPresenceRate;
      const percentage = Math.min(100, Math.round((rate / goal.targetValue) * 100));
      return {
        current: rate,
        percentage,
        isCompleted: rate >= goal.targetValue,
        label: `${rate}% de frequência (Meta: ${goal.targetValue}%)`
      };
    }

    if (goal.targetType === 'service_attendance') {
      const rate = yearlyStats.servicePresenceRate;
      const percentage = Math.min(100, Math.round((rate / goal.targetValue) * 100));
      return {
        current: rate,
        percentage,
        isCompleted: rate >= goal.targetValue,
        label: `${rate}% de frequência (Meta: ${goal.targetValue}%)`
      };
    }

    return { current: 0, percentage: 0, isCompleted: false, label: '' };
  };

  const toggleCustomGoalCompletion = (goalId: string, userId: string) => {
    const key = `louvor_custom_goal_completions_${userId}`;
    const customCompletions = JSON.parse(localStorage.getItem(key) || '{}');
    customCompletions[goalId] = !customCompletions[goalId];
    localStorage.setItem(key, JSON.stringify(customCompletions));
    
    // Refresh local goals state so UI rerenders
    const saved = localStorage.getItem('louvor_yearly_goals');
    let loadedGoals = DEFAULT_GOALS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedGoals = parsed;
        }
      } catch (e) {}
    }
    setGoals([...loadedGoals]);
  };

  const userGoals = goals.filter(g => g.assignedUserId === 'all' || g.assignedUserId === currentUserId);
  const userGoalsProgress = userGoals.map(goal => {
    const progress = getGoalProgress(goal, currentUserId || '');
    return {
      ...goal,
      progress
    };
  });
  
  const totalPercentage = userGoalsProgress.reduce((sum, g) => sum + g.progress.percentage, 0);
  const averageProgress = userGoalsProgress.length > 0 ? Math.round(totalPercentage / userGoalsProgress.length) : 0;
  const completedGoalsCount = userGoalsProgress.filter(g => g.progress.isCompleted).length;
  
  const nextEvent = events.length > 0 ? [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] : null;
  
  // Encontrar próxima escala confirmada do usuário logado
  const confirmedEvents = events.filter(event => {
    const myScale = event.scale.find(s => s.userId === currentUserId);
    return myScale && myScale.status === PresenceStatus.CONFIRMED;
  });
  const nextConfirmedEvent = confirmedEvents.length > 0 
    ? [...confirmedEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  // Encontrar número de avisos não lidos
  const unreadNoticesCount = notices.filter(notice => !readNoticeIds.includes(notice.id)).length;

  const [reflection, setReflection] = useState<string>('');
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [userStatus, setUserStatus] = useState<PresenceStatus>(PresenceStatus.PENDING);
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showFullSetlist, setShowFullSetlist] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const pinnedNotice = notices.find(n => n.isPinned);
  const gemini = GeminiService.getInstance();

  useEffect(() => {
    if (nextEvent && currentUserId) {
      const myScale = nextEvent.scale.find(s => s.userId === currentUserId);
      if (myScale) setUserStatus(myScale.status);
    }
  }, [nextEvent, currentUserId]);

  const fetchReflection = async () => {
    if (songs.length === 0) return;
    setIsLoadingReflection(true);
    const songTitles = songs.slice(0, 3).map(s => s.title);
    const text = await gemini.generateSpiritualReflection(songTitles);
    setReflection(text);
    setIsLoadingReflection(false);
  };

  useEffect(() => {
    fetchReflection();
  }, []);

  const handlePresence = (status: PresenceStatus) => {
    if (!nextEvent || !currentUserId) return;
    setUserStatus(status);
    updateEventStatus(nextEvent.id, currentUserId, status);
  };

  const handleCopyLyrics = (lyrics: string) => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCifraUrl = (song: Song) => {
    return song.driveUrl || `https://www.google.com/search?q=cifra+${song.title.replace(/ /g, '+')}+${song.artist.replace(/ /g, '+')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Olá, {currentUser?.name.split(' ')[0]}</h2>
          <p className="text-slate-500 mt-1">{settings.name} • {settings.churchName}</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sua Função</p>
          <p className="text-sm font-medium text-blue-600 flex items-center gap-1 justify-end uppercase">
             {currentUser?.function}
          </p>
        </div>
      </header>

      {/* Cartões de Resumo Rápido */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Próxima Escala Confirmada Card */}
        {nextConfirmedEvent ? (
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex items-start justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl flex items-center gap-1">
              <Check size={10} className="stroke-[3]" /> Confirmado
            </div>
            <div className="flex gap-4 items-center flex-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center shrink-0">
                <span className="text-sm font-black leading-none">{format(new Date(nextConfirmedEvent.date), "dd", { locale: ptBR })}</span>
                <span className="text-[9px] font-black uppercase leading-none mt-0.5">{format(new Date(nextConfirmedEvent.date), "MMM", { locale: ptBR })}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sua Próxima Escala</p>
                <h4 className="text-base font-bold text-slate-800 truncate mt-0.5">{nextConfirmedEvent.title}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock size={12} /> {nextConfirmedEvent.time} • <MapPin size={12} /> {nextConfirmedEvent.location}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/agenda" className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sua Próxima Escala</p>
              <h4 className="text-sm font-bold text-slate-600 mt-0.5 group-hover:text-blue-600 transition-colors">Nenhuma escala confirmada</h4>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                Toque para ver a agenda de ministrações e confirmar sua presença.
              </p>
            </div>
          </Link>
        )}

        {/* Avisos Não Lidos Card */}
        <Link to="/mural" className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex items-start justify-between group">
          <div className="flex gap-4 items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              unreadNoticesCount > 0 
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-50 animate-pulse' 
                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
            }`}>
              <Pin size={20} className={unreadNoticesCount > 0 ? 'rotate-45' : ''} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avisos Importantes</p>
              <h4 className="text-sm font-bold text-slate-700 mt-0.5">
                {unreadNoticesCount > 0 
                  ? `${unreadNoticesCount} ${unreadNoticesCount === 1 ? 'comunicado não lido' : 'comunicados não lidos'}`
                  : 'Nenhum aviso novo'
                }
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {unreadNoticesCount > 0 
                  ? 'Toque para abrir o mural e conferir os novos comunicados da equipe.'
                  : 'Você leu todos os avisos do mural. Bom trabalho!'
                }
              </p>
            </div>
          </div>
          {unreadNoticesCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md shadow-blue-100">
              {unreadNoticesCount}
            </span>
          )}
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {nextEvent ? (
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 p-20 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Calendar size={200} />
              </div>
              
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full mb-3 uppercase tracking-widest border border-blue-100">
                      Próxima Ministração
                    </span>
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{nextEvent.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">{format(new Date(nextEvent.date), "dd", { locale: ptBR })}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">{format(new Date(nextEvent.date), "MMM", { locale: ptBR })}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Horário</p>
                      <p className="text-sm font-semibold text-slate-700">{nextEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Local</p>
                      <p className="text-sm font-semibold text-slate-700">{nextEvent.location}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Sua Confirmação</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handlePresence(PresenceStatus.CONFIRMED)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all shadow-sm ${
                        userStatus === PresenceStatus.CONFIRMED 
                        ? 'bg-green-600 text-white shadow-green-200' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-green-300'
                      }`}
                    >
                      <Check size={18} /> Sim, vou servir
                    </button>
                    <button 
                      onClick={() => handlePresence(PresenceStatus.DECLINED)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all shadow-sm ${
                        userStatus === PresenceStatus.DECLINED 
                        ? 'bg-red-600 text-white shadow-red-200' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
                      }`}
                    >
                      <X size={18} /> Não poderei
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {nextEvent.scale.map((s, idx) => (
                      <div 
                        key={idx} 
                        title={`${s.userName} - ${s.function}`}
                        className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-slate-100 ${
                          s.status === PresenceStatus.CONFIRMED ? 'bg-green-500' : s.status === PresenceStatus.DECLINED ? 'bg-red-400' : 'bg-slate-300'
                        }`}
                      >
                        {s.userName.substring(0, 1)}
                      </div>
                    ))}
                  </div>
                  <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                    Escala Completa <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
               <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-500 font-medium">Nenhum evento agendado em breve.</p>
            </div>
          )}

          {/* Metas de Crescimento Anual */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600 shadow-sm shadow-blue-50">
                  <Target size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-850 tracking-tight">Suas Metas de Crescimento</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Acompanhamento das suas metas ministeriais para {new Date().getFullYear()}</p>
                </div>
              </div>
              <Link to="/membros" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 self-start sm:self-center bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all">
                Ver Painel <ChevronRight size={14} />
              </Link>
            </div>

            {userGoalsProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Gráfico Circular Recharts */}
                <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Concluído', value: averageProgress },
                            { name: 'Pendente', value: 100 - averageProgress }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={68}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell key="cell-completed" fill={averageProgress >= 100 ? '#10b981' : '#2563eb'} />
                          <Cell key="cell-remaining" fill="#f1f5f9" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-800">{averageProgress}%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Concluído</span>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-xs font-semibold text-slate-600">
                      Você completou <span className="text-blue-600 font-bold">{completedGoalsCount} de {userGoalsProgress.length}</span> metas
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {averageProgress >= 100 ? 'Parabéns! Todas as metas foram alcançadas! 🎉' : 'Continue se dedicando ao seu chamado! 🙌'}
                    </p>
                  </div>
                </div>

                {/* Lista de Metas Individuais */}
                <div className="md:col-span-7 space-y-3.5 w-full">
                  {userGoalsProgress.map((goal) => (
                    <div key={goal.id} className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100/80 hover:border-slate-200/60 transition-all flex flex-col gap-2.5 group">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{goal.title}</h5>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed" title={goal.description}>
                            {goal.description}
                          </p>
                        </div>
                        {goal.targetType === 'custom' ? (
                          <button
                            onClick={() => toggleCustomGoalCompletion(goal.id, currentUserId || '')}
                            title={goal.progress.isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                            className={`p-1.5 rounded-xl border transition-all shrink-0 hover:scale-105 active:scale-95 ${
                              goal.progress.isCompleted
                                ? 'bg-green-600 border-green-600 text-white shadow-sm shadow-green-100'
                                : 'border-slate-200 bg-white text-transparent hover:border-blue-300'
                            }`}
                          >
                            <Check size={14} className="stroke-[3]" />
                          </button>
                        ) : (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                            goal.progress.isCompleted 
                              ? 'bg-green-50 text-green-600' 
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {goal.progress.isCompleted ? 'Alcançada' : 'Ativa'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 bg-slate-200/50 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              goal.progress.isCompleted ? 'bg-green-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${goal.progress.percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0 bg-white border border-slate-100 px-2 py-0.5 rounded-lg shadow-sm">
                          {goal.progress.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Target className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm text-slate-500">Nenhuma meta anual cadastrada para você no momento.</p>
              </div>
            )}
          </section>

          <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-20">
                <Sparkles size={120} className="text-blue-400" />
             </div>
             <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Sparkles size={20} className="text-blue-300" />
                    </div>
                    <h4 className="text-xl font-bold">Reflexão para o Culto</h4>
                  </div>
                  <button 
                    onClick={fetchReflection}
                    disabled={isLoadingReflection || songs.length === 0}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={isLoadingReflection ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="min-h-[100px] flex items-center">
                  {isLoadingReflection ? (
                    <div className="space-y-3 w-full">
                      <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-white/10 rounded-full w-full animate-pulse"></div>
                      <div className="h-4 bg-white/10 rounded-full w-2/3 animate-pulse"></div>
                    </div>
                  ) : (
                    <p className="text-slate-300 leading-relaxed italic text-lg font-light">
                      "{reflection || (songs.length > 0 ? 'Toque no ícone acima para gerar uma reflexão baseada no seu repertório.' : 'Adicione músicas ao repertório para habilitar a reflexão por IA.')}"
                    </p>
                  )}
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Chat / Conversas Card */}
          <Link to="/chat" className="block bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[2rem] p-6 shadow-lg shadow-blue-100 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-white relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageSquare size={120} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[9px] font-black rounded-full uppercase tracking-widest border border-white/10">
                  Conversas da Equipe
                </span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
              </div>
              <h4 className="text-xl font-bold mb-2">Mural de Conversas</h4>
              {chatMessages && chatMessages.length > 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/5 mb-4">
                  <p className="text-[10px] font-bold text-blue-200 truncate leading-none">
                    {chatMessages[chatMessages.length - 1].senderName} • {chatMessages[chatMessages.length - 1].senderFunction}
                  </p>
                  <p className="text-xs text-slate-100 line-clamp-2 mt-1.5 leading-normal italic">
                    "{chatMessages[chatMessages.length - 1].content}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-blue-100 mb-4">Inicie um bate-papo com o grupo para alinhar ensaios e cifras!</p>
              )}
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                <span>Ir para as Conversas</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Globe size={16} className="text-slate-400" /> Recursos Globais
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {settings.youtubeChannel && (
                <a href={settings.youtubeChannel} target="_blank" className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors border border-red-100">
                  <Youtube size={16} /> <span className="text-[10px] font-bold uppercase">YouTube</span>
                </a>
              )}
              {settings.driveFolder && (
                <a href={settings.driveFolder} target="_blank" className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100">
                  <Globe size={16} /> <span className="text-[10px] font-bold uppercase">Arquivos</span>
                </a>
              )}
              {settings.spotifyPlaylist && (
                <a href={settings.spotifyPlaylist} target="_blank" className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors border border-green-100">
                  <Music size={16} /> <span className="text-[10px] font-bold uppercase">Playlist</span>
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" className="flex items-center gap-2 p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-100 transition-colors border border-pink-100">
                  <Instagram size={16} /> <span className="text-[10px] font-bold uppercase">Social</span>
                </a>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all cursor-pointer" onClick={() => pinnedNotice && setSelectedNotice(pinnedNotice)}>
            <div className="flex items-center gap-2 mb-4">
              <Pin size={16} className="text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Aviso Prioritário</span>
            </div>
            {pinnedNotice ? (
              <>
                <h4 className="font-bold text-slate-800 mb-2">{pinnedNotice.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                  {pinnedNotice.content}
                </p>
                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-colors">
                  Ver Detalhes
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum aviso fixado.</p>
            )}
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
              <ListMusic size={16} className="text-slate-400" /> Repertório Recente
            </h4>
            <div className="space-y-3">
              {songs.slice(0, 4).map(song => (
                <div 
                  key={song.id} 
                  onClick={() => setSelectedSong(song)}
                  className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate">{song.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase truncate">{song.artist}</p>
                  </div>
                  <div className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase shrink-0">
                    {song.key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNotice(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <Pin size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Comunicado</h3>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <h4 className="text-xl font-bold text-slate-800 mb-3">{selectedNotice.title}</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                <span>Por: {selectedNotice.authorName}</span>
                <span>{format(new Date(selectedNotice.date), "dd/MM/yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Song Details Modal */}
      {selectedSong && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSong(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8 pb-6 flex items-start justify-between border-b border-slate-50">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <Music size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{selectedSong.title}</h3>
                  <p className="text-slate-500 font-medium">{selectedSong.artist}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSong(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Tom</p>
                     <p className="text-2xl font-black text-blue-700">{selectedSong.key}</p>
                  </div>
                  <a href={selectedSong.youtubeUrl} target="_blank" className="bg-red-50 p-4 rounded-2xl text-center border border-red-100 flex flex-col items-center justify-center group">
                     <Youtube className="text-red-600 mb-1" size={24} />
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Vídeo</p>
                  </a>
                  <button onClick={() => handleCopyLyrics(selectedSong.lyrics)} className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100 flex flex-col items-center justify-center group">
                     {copied ? <Check className="text-green-600 mb-1" size={24} /> : <Copy className="text-slate-600 mb-1" size={24} />}
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{copied ? 'Copiado' : 'Letra'}</p>
                  </button>
               </div>
               <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Mic2 size={14} /> Letra da Música
                  </h4>
                  <div className="text-slate-700 text-lg leading-relaxed font-medium whitespace-pre-wrap font-serif italic">
                    {selectedSong.lyrics}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
