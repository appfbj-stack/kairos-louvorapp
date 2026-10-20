import React, { useState } from 'react';
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
import Login from './pages/Login';
import Signup from './pages/Signup';
import AiChat from './pages/AiChat';
import { UserRole } from './types';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminApp from './src/admin/AdminApp';

// ── Detecção de rota admin: louvorapp.fbautomacao.space/admin/* → painel Super Admin ──
// Path-based (não subdomínio) pra evitar problema de cert SSL wildcard.
function isAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin');
}

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  // O CTA da landing de vendas manda pra cá: /app/criar
  const [criando, setCriando] = useState(
    typeof window !== 'undefined' &&
      window.location.pathname.replace(/\/+$/, '').endsWith('/criar'),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Carregando seu ministério...
      </div>
    );
  }

  if (criando && !user) return <Signup onVoltar={() => setCriando(false)} />;

  if (!user) return <Login onCriarConta={() => setCriando(true)} />;

  const role = user.role as UserRole;

  return (
    <DataProvider>
      <Router>
        <Layout userRole={role} onLogout={logout}>
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
            <Route path="/kairós" element={<AiChat />} />
            <Route path="/vocal" element={<VocalTraining />} />
            <Route path="/video-aulas" element={<VideoLessons />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
};

const App: React.FC = () => {
  // Painel Super Admin: detectado por path /admin/* (não subdomínio,
  // pra evitar cert SSL wildcard). Compartilha mesmo deploy do tenant.
  if (isAdminPath()) {
    return <AdminApp />;
  }
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;