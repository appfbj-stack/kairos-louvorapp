
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import NewEvent from './pages/NewEvent';
import Repertoire from './pages/Repertoire';
import NewSong from './pages/NewSong';
import EditSong from './pages/EditSong';
import Members from './pages/Members';
import NewMember from './pages/NewMember';
import Mural from './pages/Mural';
import NewNotice from './pages/NewNotice';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import VocalTraining from './pages/VocalTraining';
import VideoLessons from './pages/VideoLessons';
import { UserRole } from './types';
import { DataProvider, useData } from './context/DataContext';
import { User as UserIcon, LogIn, ChevronRight } from 'lucide-react';
import AdminApp from './src/admin/AdminApp';

// ── Detecção de subdomínio: admin.louvorapp... → painel Super Admin ──
function isAdminSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.startsWith('admin.') || host === 'admin.localhost';
}

const Login: React.FC = () => {
  const { users, setCurrentUserId } = useData();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 text-white shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-blue-400 mb-2">Kairos louvor</h1>
          <p className="text-slate-400">Selecione seu perfil para acessar</p>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {users.map(user => (
            <button 
              key={user.id}
              onClick={() => setCurrentUserId(user.id)}
              className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{user.function}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-slate-500">O líder do ministério pode cadastrar novos membros na aba 'Membros'.</p>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUserId, users, setCurrentUserId } = useData();
  const currentUser = users.find(u => u.id === currentUserId);
  const userRole = currentUser?.role || UserRole.MEMBER;

  if (!currentUserId) {
    return <Login />;
  }

  return (
    <Router>
      <Layout userRole={userRole} onLogout={() => setCurrentUserId(null)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/agenda/novo" element={<NewEvent />} />
          <Route path="/repertorio" element={<Repertoire />} />
          <Route path="/repertorio/novo" element={<NewSong />} />
          <Route path="/repertorio/editar/:id" element={<EditSong />} />
          <Route path="/membros" element={<Members />} />
          <Route path="/membros/novo" element={<NewMember />} />
          <Route path="/mural" element={<Mural />} />
          <Route path="/mural/novo" element={<NewNotice />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/vocal" element={<VocalTraining />} />
          <Route path="/video-aulas" element={<VideoLessons />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  // Super Admin renderiza em subdomínio próprio — sem Layout de tenant
  if (isAdminSubdomain()) {
    return <AdminApp />;
  }
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
