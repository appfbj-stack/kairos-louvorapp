
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MoreVertical, 
  Search, 
  UserPlus, 
  X, 
  Calendar, 
  Music, 
  Shield, 
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Download,
  BarChart2,
  FileText,
  Check,
  Activity,
  ThumbsUp,
  Trophy,
  Target,
  Plus,
  Trash2
} from 'lucide-react';
import { User, PresenceStatus, EventType } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../context/DataContext';

export interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  targetType: 'video_lessons' | 'rehearsal_attendance' | 'service_attendance' | 'custom';
  targetValue: number; // e.g., 6 (aulas), 80 (frequência)
  targetYear: number;
  assignedUserId: string; // 'all' or a specific userId
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

const Members: React.FC = () => {
  const navigate = useNavigate();
  const { users, events, currentUserId } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'report' | 'goals'>('members');
  const [reportPeriod, setReportPeriod] = useState<'month' | 'six_months' | 'year'>('month');

  // Yearly Growth Goals States
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

  const [selectedMemberForGoals, setSelectedMemberForGoals] = useState<User | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalType, setGoalType] = useState<GrowthGoal['targetType']>('video_lessons');
  const [goalValue, setGoalValue] = useState(6);
  const [goalYear, setGoalYear] = useState(2026);
  const [goalAssignee, setGoalAssignee] = useState('all');
  const [goalError, setGoalError] = useState('');

  // Personal Custom Goals Inline State
  const [showAddPersonalGoalForm, setShowAddPersonalGoalForm] = useState(false);
  const [personalGoalTitle, setPersonalGoalTitle] = useState('');
  const [personalGoalDesc, setPersonalGoalDesc] = useState('');

  // Save goals helper
  const saveGoals = (updatedGoals: GrowthGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('louvor_yearly_goals', JSON.stringify(updatedGoals));
  };

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
    setGoals([...goals]);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalError('');

    if (!goalTitle || !goalDesc) {
      setGoalError('Por favor, preencha o título e a descrição.');
      return;
    }

    const newGoal: GrowthGoal = {
      id: 'g_' + Date.now(),
      title: goalTitle,
      description: goalDesc,
      targetType: goalType,
      targetValue: Number(goalValue),
      targetYear: Number(goalYear),
      assignedUserId: goalAssignee,
      createdDate: new Date().toISOString()
    };

    const updated = [...goals, newGoal];
    saveGoals(updated);

    setGoalTitle('');
    setGoalDesc('');
    setGoalType('video_lessons');
    setGoalValue(6);
    setGoalYear(2026);
    setGoalAssignee('all');
    setShowAddGoalModal(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Tem certeza de que deseja excluir esta meta?')) {
      const updated = goals.filter(g => g.id !== goalId);
      saveGoals(updated);
    }
  };

  const handleCreatePersonalGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalGoalTitle || !currentUserId) return;

    const newGoal: GrowthGoal = {
      id: 'g_' + Date.now(),
      title: personalGoalTitle,
      description: personalGoalDesc || 'Meta de desenvolvimento pessoal.',
      targetType: 'custom',
      targetValue: 1,
      targetYear: 2026,
      assignedUserId: currentUserId,
      createdDate: new Date().toISOString()
    };

    const updated = [...goals, newGoal];
    saveGoals(updated);

    setPersonalGoalTitle('');
    setPersonalGoalDesc('');
    setShowAddPersonalGoalForm(false);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.function.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserEvents = (userId: string) => {
    return events.filter(event => 
      event.scale.some(s => s.userId === userId)
    );
  };

  // ----- PRESENCE REPORT CALCULATIONS -----
  const today = new Date();
  
  const getLimitDate = () => {
    const d = new Date(today);
    if (reportPeriod === 'month') {
      d.setDate(today.getDate() - 30);
    } else if (reportPeriod === 'six_months') {
      d.setDate(today.getDate() - 180);
    } else {
      d.setDate(today.getDate() - 365);
    }
    return d;
  };
  
  const limitDate = getLimitDate();

  // Filter events in this period that are on or before today
  const periodEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= limitDate && eventDate <= today;
  });

  const totalRehearsals = periodEvents.filter(e => e.type === EventType.REHEARSAL).length;
  const totalServices = periodEvents.filter(e => e.type === EventType.SERVICE).length;

  const memberStats = users.map(user => {
    const userEvents = periodEvents.filter(event => 
      event.scale.some(s => s.userId === user.id)
    );

    const scheduledRehearsals = userEvents.filter(e => e.type === EventType.REHEARSAL).length;
    const attendedRehearsals = userEvents.filter(e => 
      e.type === EventType.REHEARSAL && e.scale.some(s => s.userId === user.id && s.status === PresenceStatus.CONFIRMED)
    ).length;
    const declinedRehearsals = userEvents.filter(e => 
      e.type === EventType.REHEARSAL && e.scale.some(s => s.userId === user.id && s.status === PresenceStatus.DECLINED)
    ).length;

    const scheduledServices = userEvents.filter(e => e.type === EventType.SERVICE).length;
    const attendedServices = userEvents.filter(e => 
      e.type === EventType.SERVICE && e.scale.some(s => s.userId === user.id && s.status === PresenceStatus.CONFIRMED)
    ).length;
    const declinedServices = userEvents.filter(e => 
      e.type === EventType.SERVICE && e.scale.some(s => s.userId === user.id && s.status === PresenceStatus.DECLINED)
    ).length;

    const totalScheduled = scheduledRehearsals + scheduledServices;
    const totalAttended = attendedRehearsals + attendedServices;
    const totalDeclined = declinedRehearsals + declinedServices;
    const totalPending = totalScheduled - (totalAttended + totalDeclined);

    const presenceRate = totalScheduled > 0 ? Math.round((totalAttended / totalScheduled) * 100) : 0;
    const rehearsalPresenceRate = scheduledRehearsals > 0 ? Math.round((attendedRehearsals / scheduledRehearsals) * 100) : 0;
    const servicePresenceRate = scheduledServices > 0 ? Math.round((attendedServices / scheduledServices) * 100) : 0;

    return {
      user,
      scheduledRehearsals,
      attendedRehearsals,
      declinedRehearsals,
      scheduledServices,
      attendedServices,
      declinedServices,
      totalScheduled,
      totalAttended,
      totalDeclined,
      totalPending,
      presenceRate,
      rehearsalPresenceRate,
      servicePresenceRate
    };
  });

  // Calculate team overall stats
  const teamTotalScheduled = memberStats.reduce((sum, m) => sum + m.totalScheduled, 0);
  const teamTotalAttended = memberStats.reduce((sum, m) => sum + m.totalAttended, 0);
  const teamPresenceRate = teamTotalScheduled > 0 ? Math.round((teamTotalAttended / teamTotalScheduled) * 100) : 0;

  // Find the highlight member (most present, minimum 1 event scheduled)
  const activeMembers = memberStats.filter(m => m.totalScheduled > 0);
  const highlightMember = activeMembers.length > 0 
    ? [...activeMembers].sort((a, b) => b.presenceRate - a.presenceRate)[0]
    : null;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Membro,Função,Ensaios Agendados,Ensaios Presença,Cultos Agendados,Cultos Presença,Presença Geral (%)\n";
    
    memberStats.forEach(m => {
      csvContent += `"${m.user.name}","${m.user.function}",${m.scheduledRehearsals},${m.attendedRehearsals},${m.scheduledServices},${m.attendedServices},${m.presenceRate}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio-presenca-${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ----------------------------------------

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Membros</h2>
          <p className="text-slate-500">Time do ministério de louvor.</p>
        </div>
        <button 
          onClick={() => navigate('/membros/novo')}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          <UserPlus size={20} />
          <span>Convidar Membro</span>
        </button>
      </header>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Lista de Membros
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'report'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Relatório de Presença
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'goals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Metas de Crescimento
        </button>
      </div>

      {activeTab === 'members' ? (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou função..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 transition-colors">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{user.name}</h3>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{user.function}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <Mail size={16} className="shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <Phone size={16} className="shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedProfile(user)}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Ver Perfil
                  </button>
                  <button 
                    onClick={() => setSelectedHistory(user)}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Histórico
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : activeTab === 'report' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Período de Análise</h3>
                <p className="text-xs text-slate-500 font-medium">Selecione o intervalo de tempo para calcular as presenças.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
                <button
                  onClick={() => setReportPeriod('month')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    reportPeriod === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Este Mês
                </button>
                <button
                  onClick={() => setReportPeriod('six_months')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    reportPeriod === 'six_months' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  6 Meses
                </button>
                <button
                  onClick={() => setReportPeriod('year')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    reportPeriod === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1 Ano
                </button>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shrink-0 ml-auto md:ml-0"
              >
                <Download size={14} /> Exportar CSV
              </button>
            </div>
          </div>

          {/* Bento Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-4 bottom-4 text-white/5 pointer-events-none">
                <TrendingUp size={96} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full">Geral do Time</span>
              <h4 className="text-4xl font-serif font-black mt-4">{teamPresenceRate}%</h4>
              <p className="text-slate-300 text-xs mt-1">Taxa média de comparecimento do ministério inteiro.</p>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-4">
                <div className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${teamPresenceRate}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-4 bottom-4 text-slate-50 pointer-events-none">
                <BarChart2 size={96} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Atividades Realizadas</span>
              <div className="flex gap-6 mt-4">
                <div>
                  <h4 className="text-3xl font-black text-slate-800">{totalRehearsals}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ensaios</p>
                </div>
                <div className="border-l border-slate-100 pl-6">
                  <h4 className="text-3xl font-black text-slate-800">{totalServices}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Cultos</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-4">Total de {totalRehearsals + totalServices} eventos realizados.</p>
            </div>

            {highlightMember && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-4 bottom-4 text-white/5 pointer-events-none">
                  <Award size={96} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full">Destaque de Frequência</span>
                <h4 className="text-lg font-bold mt-4 truncate">{highlightMember.user.name}</h4>
                <p className="text-blue-100 text-xs truncate uppercase tracking-wider font-bold mt-0.5">{highlightMember.user.function}</p>
                <div className="flex items-center gap-1.5 mt-3 text-emerald-200 text-xs font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
                  <ThumbsUp size={12} /> {highlightMember.presenceRate}% de presença confirmada
                </div>
              </div>
            )}
          </div>

          {/* Detailed Attendance List */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Frequência Detalhada</h3>
              <span className="text-xs text-slate-400 font-medium">Contagem por tipo de evento</span>
            </div>
            <div className="divide-y divide-slate-100">
              {memberStats.map(({ 
                user, 
                scheduledRehearsals, 
                attendedRehearsals, 
                scheduledServices, 
                attendedServices, 
                presenceRate,
                rehearsalPresenceRate,
                servicePresenceRate,
                totalScheduled
              }) => (
                <div key={user.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all group">
                  {/* User Profile info */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black group-hover:bg-blue-600 transition-colors shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base leading-none">{user.name}</h4>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1.5">{user.function}</p>
                    </div>
                  </div>

                  {/* Rehearsals and Services split progress bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                          <Music size={12} className="text-amber-500" /> Ensaios Participados
                        </span>
                        <span className="font-bold text-slate-700">{attendedRehearsals} de {scheduledRehearsals} ({rehearsalPresenceRate}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${rehearsalPresenceRate}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                          <Calendar size={12} className="text-purple-500" /> Cultos Participados
                        </span>
                        <span className="font-bold text-slate-700">{attendedServices} de {scheduledServices} ({servicePresenceRate}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${servicePresenceRate}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Global Rate Display and Badge */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Presença Geral</p>
                      <div className="flex items-baseline gap-1 mt-1 lg:justify-end">
                        <span className="text-2xl font-black text-slate-800 leading-none">{presenceRate}%</span>
                      </div>
                    </div>

                    <div className="shrink-0 min-w-[100px] text-right">
                      {presenceRate >= 85 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                          Excelente
                        </span>
                      ) : presenceRate >= 70 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100">
                          Bom
                        </span>
                      ) : totalScheduled === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1.5 rounded-full border border-slate-100">
                          Sem Escala
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100">
                          Ajustar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-6 bottom-0 opacity-[0.06] pointer-events-none">
              <Trophy size={200} />
            </div>
            
            <div className="relative max-w-2xl space-y-4">
              <span className="px-3.5 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-500/10">
                Plano de Crescimento 2026
              </span>
              <h3 className="text-3xl font-serif font-bold text-blue-200">
                {currentUser?.role === 'LEADER' 
                  ? 'Painel de Crescimento dos Músicos' 
                  : `Olá, ${currentUser?.name}! Suas Metas de Estudo`}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentUser?.role === 'LEADER'
                  ? 'Acompanhe a evolução técnica e espiritual do ministério. Defina metas de vídeo-aulas, presença em ensaios/cultos ou desafios personalizados.'
                  : 'A excelência técnica e o compromisso espiritual andam juntos. Acompanhe abaixo seu progresso anual nas metas ministeriais e gerencie seus estudos pessoais.'}
              </p>
              
              {currentUser?.role === 'LEADER' && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Criar Nova Meta Coletiva ou Individual</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Leader View vs Member View */}
          {currentUser?.role === 'LEADER' ? (
            <div className="space-y-8">
              {/* Leader View - Musician Tracking List */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" /> Progresso dos Músicos (Ano Corrente)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Veja a quantidade de metas concluídas de cada integrante do time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map(user => {
                    // Filter goals assigned to 'all' or this specific user
                    const userAssignedGoals = goals.filter(g => g.assignedUserId === 'all' || g.assignedUserId === user.id);
                    const completedCount = userAssignedGoals.filter(g => getGoalProgress(g, user.id).isCompleted).length;
                    const totalCount = userAssignedGoals.length;
                    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                    return (
                      <div 
                        key={user.id} 
                        className="bg-slate-50 rounded-2xl p-5 border border-slate-100/80 hover:bg-slate-50/50 hover:border-slate-200 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-800 text-xs truncate">{user.name}</h5>
                              <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold truncate">{user.function}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Metas Concluídas</span>
                              <span>{completedCount} de {totalCount} ({progressPercentage}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progressPercentage === 100 
                                    ? 'bg-emerald-500' 
                                    : progressPercentage >= 50 
                                    ? 'bg-blue-600' 
                                    : 'bg-amber-500'
                                }`} 
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 mt-2 flex justify-between items-center border-t border-slate-200/50">
                          {progressPercentage === 100 ? (
                            <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                              🏆 100% Completo
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-slate-400">
                              Em desenvolvimento
                            </span>
                          )}

                          <button
                            onClick={() => setSelectedMemberForGoals(user)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            <span>Ver Metas Detalhadas</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leader View - Goals Catalog & Management */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Target size={20} className="text-blue-600" /> Diretriz de Metas Ativas
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Lista de todas as metas globais e individuais registradas no sistema.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {goals.map(goal => {
                    const assigneeName = goal.assignedUserId === 'all' 
                      ? 'Todos os Membros' 
                      : users.find(u => u.id === goal.assignedUserId)?.name || 'Membro removido';

                    return (
                      <div key={goal.id} className="py-5 flex items-start justify-between gap-4 group">
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                              {goal.targetType === 'video_lessons' && 'Aulas assistidas'}
                              {goal.targetType === 'rehearsal_attendance' && 'Presença ensaios'}
                              {goal.targetType === 'service_attendance' && 'Presença cultos'}
                              {goal.targetType === 'custom' && 'Meta prática livre'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Destinado a: <strong className="text-slate-600">{assigneeName}</strong>
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-800 text-sm leading-tight">{goal.title}</h5>
                          <p className="text-slate-500 text-xs leading-relaxed">{goal.description}</p>
                          <p className="text-[10px] font-bold text-slate-400">Meta: {goal.targetValue} {goal.targetType === 'video_lessons' ? 'aulas' : (goal.targetType === 'rehearsal_attendance' || goal.targetType === 'service_attendance') ? '%' : 'sessão'} | Ano: {goal.targetYear}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all self-center"
                          title="Excluir meta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Member View - My Progress Summary Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                      <Award className="text-blue-600" size={22} /> Meu Acompanhamento Técnico e Prático
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Conclua as atividades propostas pelo ministério para evoluir no seu instrumento.</p>
                  </div>

                  <div className="space-y-4">
                    {goals
                      .filter(g => g.assignedUserId === 'all' || g.assignedUserId === currentUserId)
                      .map(goal => {
                        const progress = getGoalProgress(goal, currentUserId || '');
                        
                        return (
                          <div 
                            key={goal.id} 
                            className={`p-6 border rounded-2xl transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              progress.isCompleted 
                                ? 'bg-emerald-50/40 border-emerald-100' 
                                : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200'
                            }`}
                          >
                            <div className="space-y-1.5 max-w-xl">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  progress.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {goal.targetType === 'video_lessons' && 'Vídeo-Aulas'}
                                  {goal.targetType === 'rehearsal_attendance' && 'Presença Ensaios'}
                                  {goal.targetType === 'service_attendance' && 'Presença Cultos'}
                                  {goal.targetType === 'custom' && 'Estudo Livre'}
                                </span>
                                {progress.isCompleted && (
                                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Concluída!
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-slate-800 text-sm leading-tight">{goal.title}</h5>
                              <p className="text-slate-500 text-xs leading-relaxed">{goal.description}</p>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-1.5 min-w-[150px] shrink-0">
                              <span className="text-xs font-bold text-slate-700">{progress.label}</span>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    progress.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                              
                              {goal.targetType === 'custom' && (
                                <button
                                  onClick={() => toggleCustomGoalCompletion(goal.id, currentUserId || '')}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border mt-2 transition-all active:scale-95 ${
                                    progress.isCompleted 
                                      ? 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                                      : 'bg-blue-600 border-transparent text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {progress.isCompleted ? 'Marcar como Pendente' : 'Marcar como Feito'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Member View - Personal Goals sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                        <Target className="text-blue-600" size={16} /> Minhas Metas de Estudo Livre
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">Crie seus próprios desafios individuais de prática diária.</p>
                    </div>
                    <button
                      onClick={() => setShowAddPersonalGoalForm(!showAddPersonalGoalForm)}
                      className="p-1.5 hover:bg-slate-100 rounded-xl text-blue-600 transition-colors"
                      title="Adicionar Meta de Prática"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {showAddPersonalGoalForm && (
                    <form onSubmit={handleCreatePersonalGoal} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3 animate-in slide-in-from-top-4 duration-300">
                      <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Novo Alvo de Estudo</h5>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400">Título</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-bold"
                          placeholder="Ex: Decorar música de domingo"
                          value={personalGoalTitle}
                          onChange={e => setPersonalGoalTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400">Descrição / Foco</label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none"
                          placeholder="Detalhes adicionais ou notas de estudo..."
                          value={personalGoalDesc}
                          onChange={e => setPersonalGoalDesc(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Salvar Meta Pessoal
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {goals.filter(g => g.assignedUserId === currentUserId && g.targetType === 'custom').length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <p className="text-xs text-slate-400 font-medium">Você não possui metas pessoais cadastradas.</p>
                      </div>
                    ) : (
                      goals
                        .filter(g => g.assignedUserId === currentUserId && g.targetType === 'custom')
                        .map(goal => {
                          const progress = getGoalProgress(goal, currentUserId || '');
                          
                          return (
                            <div key={goal.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3 relative group">
                              <input
                                type="checkbox"
                                checked={progress.isCompleted}
                                onChange={() => toggleCustomGoalCompletion(goal.id, currentUserId || '')}
                                className="w-4 h-4 rounded text-blue-600 mt-0.5 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <h6 className={`font-bold text-xs ${progress.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                  {goal.title}
                                </h6>
                                <p className={`text-[10px] ${progress.isCompleted ? 'text-slate-300 line-through' : 'text-slate-500'}`}>
                                  {goal.description}
                                </p>
                              </div>

                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-opacity"
                                title="Remover"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leader Modal: Add Goal */}
          {showAddGoalModal && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-300">
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={20} />
                </button>

                <div className="space-y-2 mb-6">
                  <h4 className="text-xl font-serif font-bold text-slate-900">Nova Meta de Crescimento</h4>
                  <p className="text-xs text-slate-400">Defina um alvo anual para os músicos estudarem e se comprometerem.</p>
                </div>

                {goalError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl flex items-center gap-1.5 mb-4">
                    <AlertCircle size={16} />
                    <span>{goalError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Título da Meta</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-bold"
                      placeholder="Ex: Especialização de Teclado ou Fidelidade de Ensaios"
                      value={goalTitle}
                      onChange={e => setGoalTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Descrição / Objetivo</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none"
                      placeholder="Descreva o que o músico deve realizar e como medir o sucesso..."
                      value={goalDesc}
                      onChange={e => setGoalDesc(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Métrica Alvo</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-medium"
                        value={goalType}
                        onChange={e => {
                          const type = e.target.value as GrowthGoal['targetType'];
                          setGoalType(type);
                          if (type === 'video_lessons') setGoalValue(6);
                          else if (type === 'rehearsal_attendance') setGoalValue(80);
                          else if (type === 'service_attendance') setGoalValue(85);
                          else setGoalValue(1);
                        }}
                      >
                        <option value="video_lessons">Vídeo-Aulas Assistidas</option>
                        <option value="rehearsal_attendance">Presença Ensaios (%)</option>
                        <option value="service_attendance">Presença Cultos (%)</option>
                        <option value="custom">Estudo Livre Coletivo / Prática</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Valor Alvo (Target)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-bold"
                        value={goalValue}
                        onChange={e => setGoalValue(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Atribuir Meta A</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-medium"
                        value={goalAssignee}
                        onChange={e => setGoalAssignee(e.target.value)}
                      >
                        <option value="all">Todos os Membros</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Ano Alvo</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-bold"
                        value={goalYear}
                        onChange={e => setGoalYear(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddGoalModal(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                    >
                      Criar Meta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Leader Modal: Member Goal Details */}
          {selectedMemberForGoals && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedMemberForGoals(null)}
                  className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-xl">
                    {selectedMemberForGoals.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-slate-900">{selectedMemberForGoals.name}</h4>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{selectedMemberForGoals.function}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Status das Metas no Ano</h5>

                  {goals
                    .filter(g => g.assignedUserId === 'all' || g.assignedUserId === selectedMemberForGoals.id)
                    .map(goal => {
                      const progress = getGoalProgress(goal, selectedMemberForGoals.id);

                      return (
                        <div key={goal.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              {goal.targetType === 'video_lessons' && 'Vídeo-Aulas'}
                              {goal.targetType === 'rehearsal_attendance' && 'Presença Ensaios'}
                              {goal.targetType === 'service_attendance' && 'Presença Cultos'}
                              {goal.targetType === 'custom' && 'Meta Prática'}
                            </span>
                            <span className="text-xs font-bold text-slate-700">{progress.label}</span>
                          </div>
                          <div>
                            <h6 className="font-bold text-slate-800 text-xs">{goal.title}</h6>
                            <p className="text-[10px] text-slate-500">{goal.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${progress.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-black uppercase shrink-0 ${progress.isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {progress.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {goals.filter(g => g.assignedUserId === 'all' || g.assignedUserId === selectedMemberForGoals.id).length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6">Este músico não possui metas atribuídas para o ano corrente.</p>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedMemberForGoals(null)}
                    className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-2xl transition-all"
                  >
                    Fechar Detalhes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Perfil do Membro */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedProfile(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8 pb-4 flex justify-end">
              <button onClick={() => setSelectedProfile(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="px-8 pb-8 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-xl shadow-slate-200">
                {selectedProfile.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{selectedProfile.name}</h3>
              <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">{selectedProfile.function}</p>
              
              <div className="mt-8 space-y-3">
                <a href={`mailto:${selectedProfile.email}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                    <Mail size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">E-mail</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedProfile.email}</p>
                  </div>
                </a>

                <a href={`https://wa.me/${selectedProfile.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-green-500">
                    <Phone size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Telefone / WhatsApp</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedProfile.phone}</p>
                  </div>
                  <MessageCircle size={14} className="ml-auto text-slate-300" />
                </a>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                    <Shield size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Nível de Acesso</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedProfile.role === 'LEADER' ? 'Administrador / Líder' : 'Membro Comum'}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedProfile(null)}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Histórico de Escala */}
      {selectedHistory && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedHistory(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Histórico de Escala</h3>
                <p className="text-sm text-slate-500">{selectedHistory.name}</p>
              </div>
              <button onClick={() => setSelectedHistory(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
              {getUserEvents(selectedHistory.id).length > 0 ? (
                getUserEvents(selectedHistory.id).map(event => {
                  const myScale = event.scale.find(s => s.userId === selectedHistory.id);
                  return (
                    <div key={event.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{event.type}</p>
                          <h4 className="font-bold text-slate-800">{event.title}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-700">{format(new Date(event.date), "dd/MM/yyyy")}</p>
                          <p className="text-xs text-slate-400">{event.time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Music size={14} />
                          <span>Como: <strong>{myScale?.function}</strong></span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                           {myScale?.status === PresenceStatus.CONFIRMED && (
                             <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                               <CheckCircle2 size={12} /> Confirmado
                             </span>
                           )}
                           {myScale?.status === PresenceStatus.DECLINED && (
                             <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                               <XCircle size={12} /> Recusado
                             </span>
                           )}
                           {myScale?.status === PresenceStatus.PENDING && (
                             <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                               <AlertCircle size={12} /> Pendente
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                   <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                   <p className="text-slate-400 font-medium">Nenhuma escala registrada para este membro.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-white md:hidden">
              <button 
                onClick={() => setSelectedHistory(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Yearly stats helper computed in 365 day window
const today = new Date();
const getYearlyUserStats = (userId: string, events: any[]) => {
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

export default Members;
