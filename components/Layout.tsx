
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  Music, 
  Users, 
  Megaphone, 
  Home, 
  LogOut,
  Settings as SettingsIcon,
  MessageSquare,
  Mic,
  Tv
} from 'lucide-react';
import { UserRole } from '../types';
import { useData } from '../context/DataContext';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, onLogout }) => {
  const { settings } = useData();

  const navItems = [
    { to: '/', icon: Home, label: 'Início' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/repertorio', icon: Music, label: 'Repertório' },
    ...(settings?.enableVocalTraining !== false ? [{ to: '/vocal', icon: Mic, label: 'Técnica Vocal' }] : []),
    ...(settings?.enableVideoLessons !== false ? [{ to: '/video-aulas', icon: Tv, label: 'Vídeo-Aulas' }] : []),
    { to: '/membros', icon: Users, label: 'Membros' },
    { to: '/mural', icon: Megaphone, label: 'Mural' },
    { to: '/chat', icon: MessageSquare, label: 'Conversas' },
  ];

  // Adicionar Configurações para Líderes
  if (userRole === UserRole.LEADER) {
    navItems.push({ to: '/configuracoes', icon: SettingsIcon, label: 'Configurações' });
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold text-blue-400">Kairos louvor</h1>
          <p className="text-xs text-slate-400 mt-1">Ministério de Unidade</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 mb-20 md:mb-0 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-3 safe-bottom z-50 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-colors min-w-[64px]
              ${isActive ? 'text-blue-600' : 'text-slate-400'}
            `}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
