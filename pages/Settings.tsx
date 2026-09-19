import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Youtube, 
  Globe, 
  Instagram, 
  Music, 
  Layout, 
  ShieldCheck, 
  CheckCircle,
  Download,
  Upload,
  AlertTriangle,
  FileJson,
  Users,
  MessageSquare,
  Clock,
  Trash2,
  UserPlus,
  Sliders,
  Database,
  Shield,
  Check,
  X,
  User as UserIcon,
  Tv,
  Mic,
  Plus
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole, User } from '../types';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    settings, 
    updateSettings, 
    exportData, 
    importData,
    songs,
    events,
    notices,
    clearChat,
    currentUserId
  } = useData();

  const [activeTab, setActiveTab] = useState<'info' | 'features' | 'members' | 'system'>('info');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // State for Settings form
  const [formData, setFormData] = useState({
    name: settings?.name || 'Kairos louvor',
    churchName: settings?.churchName || 'Igreja Local',
    youtubeChannel: settings?.youtubeChannel || '',
    driveFolder: settings?.driveFolder || '',
    spotifyPlaylist: settings?.spotifyPlaylist || '',
    instagram: settings?.instagram || '',
    allowMemberChat: settings?.allowMemberChat !== false,
    allowMemberNotices: settings?.allowMemberNotices !== false,
    confirmationDeadlineDays: settings?.confirmationDeadlineDays ?? 3,
    enableVocalTraining: settings?.enableVocalTraining !== false,
    enableVideoLessons: settings?.enableVideoLessons !== false,
  });

  // Sync state if settings change
  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name,
        churchName: settings.churchName,
        youtubeChannel: settings.youtubeChannel || '',
        driveFolder: settings.driveFolder || '',
        spotifyPlaylist: settings.spotifyPlaylist || '',
        instagram: settings.instagram || '',
        allowMemberChat: settings.allowMemberChat !== false,
        allowMemberNotices: settings.allowMemberNotices !== false,
        confirmationDeadlineDays: settings.confirmationDeadlineDays ?? 3,
        enableVocalTraining: settings.enableVocalTraining !== false,
        enableVideoLessons: settings.enableVideoLessons !== false,
      });
    }
  }, [settings]);

  // Form states for adding a new member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberFunction, setNewMemberFunction] = useState('Vocal');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>(UserRole.MEMBER);
  const [showAddForm, setShowAddForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      updateSettings(formData);
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 400);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: User = {
      id: `user_${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || `${newMemberName.toLowerCase().replace(/\s+/g, '')}@kairos.com`,
      role: newMemberRole,
      function: newMemberFunction,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150`,
      growthGoals: []
    };

    addUser(newMember);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberFunction('Vocal');
    setNewMemberRole(UserRole.MEMBER);
    setShowAddForm(false);
  };

  const handleToggleRole = (user: User) => {
    // Avoid demoting current logged user
    if (user.id === currentUserId) {
      alert("Você não pode alterar o seu próprio cargo de administrador!");
      return;
    }
    const updatedUser = {
      ...user,
      role: user.role === UserRole.LEADER ? UserRole.MEMBER : UserRole.LEADER
    };
    updateUser(updatedUser);
  };

  const handleUpdateFunction = (user: User, func: string) => {
    const updatedUser = {
      ...user,
      function: func
    };
    updateUser(updatedUser);
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUserId) {
      alert("Você não pode excluir a si mesmo!");
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o integrante ${user.name} do ministério?`)) {
      deleteUser(user.id);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-kairos-louvor-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (importData(json)) {
        alert('Dados importados com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } else {
        alert('Erro ao importar arquivo. Verifique se o formato está correto.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearChatHistory = () => {
    if (window.confirm("Deseja realmente limpar todo o histórico do chat de conversas? Esta ação não pode ser desfeita.")) {
      clearChat();
      alert("Histórico do chat limpo com sucesso!");
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm("ATENÇÃO: Deseja redefinir todo o aplicativo para as configurações e dados padrão do Kairos? Todos os registros locais adicionados serão apagados.")) {
      localStorage.clear();
      alert("Aplicativo redefinido com sucesso! Recarregando...");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-3 hover:bg-white rounded-2xl transition-colors border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Painel do Administrador</h2>
            <p className="text-slate-500 text-sm">Gerencie o time de 12 pessoas, permissões, recursos e integrações.</p>
          </div>
        </div>
        
        {/* Quick Save Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <ShieldCheck size={14} className="mr-1" /> Líder Autorizado
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px mb-8 no-scrollbar">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
            activeTab === 'info' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Layout size={16} />
          <span>Identidade & Links</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
            activeTab === 'features' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Sliders size={16} />
          <span>Recursos do App</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
            activeTab === 'members' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Users size={16} />
          <span>Gestão da Equipe</span>
          <span className="ml-1 bg-slate-100 text-slate-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
            activeTab === 'system' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Database size={16} />
          <span>Sincronização & Sistema</span>
        </button>
      </div>

      {/* TAB CONTENT: INFO */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layout size={18} className="text-blue-500" /> Identidade do Ministério
              </h4>
              <p className="text-xs text-slate-400 mt-1">Configurações visuais e de marca do ministério no app.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Nome do Ministério</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-800 shadow-sm"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Nome da Igreja</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-800 shadow-sm"
                  value={formData.churchName}
                  onChange={e => setFormData({ ...formData, churchName: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> Links Globais e Integrações
              </h4>
              <p className="text-xs text-slate-400 mt-1">Links rápidos que aparecerão como referências e guias na página inicial de todos os integrantes.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
                  <Youtube size={14} className="text-red-500" /> Canal do YouTube (Ensaios / Repertório)
                </label>
                <input 
                  type="url" 
                  placeholder="https://youtube.com/@seucanal"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-700 shadow-sm"
                  value={formData.youtubeChannel}
                  onChange={e => setFormData({ ...formData, youtubeChannel: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-500" /> Pasta do Google Drive (Cifras e Partituras)
                </label>
                <input 
                  type="url" 
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-700 shadow-sm"
                  value={formData.driveFolder}
                  onChange={e => setFormData({ ...formData, driveFolder: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
                  <Music size={14} className="text-green-500" /> Playlist de Referência do Spotify
                </label>
                <input 
                  type="url" 
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-700 shadow-sm"
                  value={formData.spotifyPlaylist}
                  onChange={e => setFormData({ ...formData, spotifyPlaylist: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
                  <Instagram size={14} className="text-pink-500" /> Instagram Oficial do Ministério
                </label>
                <input 
                  type="url" 
                  placeholder="https://instagram.com/seuministerio"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-700 shadow-sm"
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
              showSuccess 
              ? 'bg-green-600 text-white' 
              : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : showSuccess ? (
              <>
                <CheckCircle size={20} /> Informações Salvas com Sucesso!
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Configurações
              </>
            )}
          </button>
        </form>
      )}

      {/* TAB CONTENT: FEATURES */}
      {activeTab === 'features' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sliders size={18} className="text-blue-500" /> Gestão de Recursos e Recursos Dinâmicos
              </h4>
              <p className="text-xs text-slate-400 mt-1">Selecione quais telas e funcionalidades do aplicativo estarão disponíveis para a equipe.</p>
            </div>

            <div className="divide-y divide-slate-100">
              
              {/* Toggle Chat */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MessageSquare size={16} className="text-slate-400" /> Permitir Mensagens no Chat
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">Se desativado, apenas líderes poderão publicar e interagir no Mural de Conversas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowMemberChat: !formData.allowMemberChat })}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    formData.allowMemberChat ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    formData.allowMemberChat ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle Mural Notices */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Layout size={16} className="text-slate-400" /> Criar Avisos no Mural
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">Se ativado, membros comuns também poderão criar avisos novos no Mural do time.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowMemberNotices: !formData.allowMemberNotices })}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    formData.allowMemberNotices ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    formData.allowMemberNotices ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle Vocal Training */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Mic size={16} className="text-slate-400" /> Exibir Guia de Técnica Vocal
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">Ativar ou ocultar a aba de aquecimentos e exercícios vocais no menu lateral.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, enableVocalTraining: !formData.enableVocalTraining })}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    formData.enableVocalTraining ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    formData.enableVocalTraining ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle Video Lessons */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Tv size={16} className="text-slate-400" /> Exibir Guia de Vídeo-Aulas
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">Ativar ou ocultar a aba de videoaulas e tutoriais musicais.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, enableVideoLessons: !formData.enableVideoLessons })}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    formData.enableVideoLessons ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    formData.enableVideoLessons ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Deadline Days */}
              <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" /> Prazo Limite para Confirmação de Escala
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">Dias de antecedência recomendados para confirmação de presença em eventos.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="14"
                    className="w-16 text-center px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm"
                    value={formData.confirmationDeadlineDays}
                    onChange={e => setFormData({ ...formData, confirmationDeadlineDays: parseInt(e.target.value) || 3 })}
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dias</span>
                </div>
              </div>

            </div>
          </section>

          {/* Save Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
              showSuccess 
              ? 'bg-green-600 text-white' 
              : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : showSuccess ? (
              <>
                <CheckCircle size={20} /> Recursos Atualizados!
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Recursos
              </>
            )}
          </button>
        </form>
      )}

      {/* TAB CONTENT: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Membros do Ministério (12 Pessoas)</h3>
              <p className="text-xs text-slate-400">Promova integrantes para líder, altere instrumentos ou exclua usuários.</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <UserPlus size={16} />
              <span>{showAddForm ? 'Cancelar' : 'Novo Integrante'}</span>
            </button>
          </div>

          {/* NEW MEMBER FORM */}
          {showAddForm && (
            <form onSubmit={handleAddMember} className="bg-slate-50 border border-slate-200/80 rounded-[2rem] p-6 shadow-inner space-y-4 animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                <UserPlus size={18} className="text-blue-500" />
                <h4 className="text-sm font-bold text-slate-700">Cadastrar Novo Integrante</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: João Souza"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800 font-medium"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Identidade</label>
                  <input
                    type="email"
                    placeholder="joao@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800 font-medium"
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo no App</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800 font-medium"
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value as UserRole)}
                  >
                    <option value={UserRole.MEMBER}>Membro Comum</option>
                    <option value={UserRole.LEADER}>Líder (Acesso Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Função / Instrumento Principal</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Violão / Vocal / Teclado"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800 font-medium"
                    value={newMemberFunction}
                    onChange={e => setNewMemberFunction(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Salvar e Registrar Integrante
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MEMBERS LIST TABLE */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Integrante</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Função Principal</th>
                    <th className="p-4 pr-6 text-xs font-bold text-slate-400 text-right uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = u.id === currentUserId;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Name & Avatar */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-sm overflow-hidden shrink-0">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                u.name.charAt(0)
                              )}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-none flex items-center gap-1">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Você</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Switcher */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u)}
                            disabled={isSelf}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              u.role === UserRole.LEADER 
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                                : 'bg-slate-100 text-slate-600 border border-transparent'
                            } ${isSelf ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 active:scale-95'}`}
                            title={isSelf ? '' : 'Clique para alternar entre Líder e Membro'}
                          >
                            <span className="flex items-center gap-1">
                              <Shield size={12} />
                              {u.role === UserRole.LEADER ? 'Líder / Admin' : 'Membro'}
                            </span>
                          </button>
                        </td>

                        {/* Function / Instrument Input */}
                        <td className="p-4">
                          <input
                            type="text"
                            className="bg-transparent hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 outline-none w-36 transition-all border border-transparent focus:border-slate-200"
                            value={u.function}
                            onChange={(e) => handleUpdateFunction(u, e.target.value)}
                            title="Editar instrumento diretamente"
                          />
                        </td>

                        {/* Delete Action */}
                        <td className="p-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={isSelf}
                            className={`p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ${
                              isSelf ? 'opacity-30 cursor-not-allowed' : 'active:scale-90'
                            }`}
                            title="Excluir do ministério"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SYSTEM */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          
          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
              <Users className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="text-2xl font-black text-slate-800">{users.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Integrantes</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
              <Music className="mx-auto text-green-600 mb-2" size={24} />
              <p className="text-2xl font-black text-slate-800">{songs.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Músicas Ativas</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
              <Globe className="mx-auto text-orange-600 mb-2" size={24} />
              <p className="text-2xl font-black text-slate-800">{events.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Agendas Cadastradas</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
              <MessageSquare className="mx-auto text-indigo-600 mb-2" size={24} />
              <p className="text-2xl font-black text-slate-800">{notices.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Mural / Avisos</p>
            </div>

          </div>

          {/* Backup Action Cards */}
          <section className="bg-blue-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 opacity-10">
              <FileJson size={160} />
            </div>
            <div className="relative">
              <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Download size={20} /> Backup Completo de Dados
              </h4>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                Como os dados estão salvos no navegador, exporte e guarde o arquivo JSON de backup para garantir que você não perderá suas cifras, escalas e cadastro de membros do Kairos louvor.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 py-4 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold transition-all"
                >
                  <Download size={18} /> Exportar Backup JSON
                </button>
                <button 
                  onClick={handleImportClick}
                  className="flex items-center justify-center gap-2 py-4 px-4 bg-blue-500 hover:bg-blue-400 rounded-2xl font-bold transition-all shadow-lg"
                >
                  <Upload size={18} /> Importar Backup JSON
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleFileChange} 
                />
              </div>
            </div>
          </section>

          {/* Database Reset & Clearing */}
          <section className="bg-white rounded-[2rem] p-8 border border-red-100 shadow-sm space-y-6">
            <div>
              <h4 className="text-sm font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={18} /> Zona de Perigo Administrativa
              </h4>
              <p className="text-xs text-slate-400 mt-1">Procedimentos destrutivos de manutenção do banco de dados local.</p>
            </div>

            <div className="divide-y divide-slate-100">
              
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Limpar Conversas do Chat</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Apaga todas as mensagens trocadas no mural de conversas pelos integrantes.</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearChatHistory}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  <span>Limpar Histórico Chat</span>
                </button>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Restaurar Banco de Dados do Kairos Louvor</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Apaga todos os dados locais e restaura os usuários, cifras e escalas originais do ministério.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                >
                  <Database size={14} />
                  <span>Restaurar Kairos Padrão</span>
                </button>
              </div>

            </div>
          </section>

        </div>
      )}

    </div>
  );
};

export default Settings;
