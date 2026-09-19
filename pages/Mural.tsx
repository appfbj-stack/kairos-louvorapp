
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Pin, MessageSquare, Plus, User, Calendar, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserRole } from '../types';

const Mural: React.FC = () => {
  const navigate = useNavigate();
  const { notices, readNoticeIds, markNoticeAsRead, markAllNoticesAsRead, users, currentUserId, settings } = useData();

  const currentUser = users.find(u => u.id === currentUserId);
  const canCreateNotice = currentUser?.role === UserRole.LEADER || settings?.allowMemberNotices !== false;

  // Mark all notices as read when the user enters the Mural page
  useEffect(() => {
    notices.forEach(notice => {
      markNoticeAsRead(notice.id);
    });
  }, [notices, markNoticeAsRead]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Mural</h2>
          <p className="text-slate-500">Avisos e comunicações oficiais.</p>
        </div>
        <div className="flex gap-2">
          {notices.some(n => !readNoticeIds.includes(n.id)) && (
            <button 
              onClick={markAllNoticesAsRead}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck size={16} />
              <span>Marcar todos como lidos</span>
            </button>
          )}
          {canCreateNotice && (
            <button 
              onClick={() => navigate('/mural/novo')}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} />
              <span>Novo Aviso</span>
            </button>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {notices.map(notice => {
          const isRead = readNoticeIds.includes(notice.id);
          return (
            <div 
              key={notice.id} 
              className={`bg-white rounded-[2rem] p-8 shadow-sm border transition-all hover:shadow-md relative overflow-hidden ${
                notice.isPinned ? 'border-blue-200 ring-1 ring-blue-50' : 'border-slate-100'
              }`}
            >
              {!isRead && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                  Novo
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {notice.isPinned && (
                    <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-100">
                      <Pin size={16} />
                    </div>
                  )}
                  <div>
                     <h3 className="text-xl font-bold text-slate-800 tracking-tight">{notice.title}</h3>
                     <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <User size={12} /> {notice.authorName}
                        </div>
                        <span className="text-slate-200">•</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Calendar size={12} /> {format(new Date(notice.date), "dd 'de' MMMM", { locale: ptBR })}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 leading-relaxed mb-8 text-lg font-light">
                {notice.content}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <button className="flex items-center gap-2 text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors py-2 px-4 hover:bg-slate-50 rounded-xl">
                   <MessageSquare size={18} />
                   <span>Comentários</span>
                 </button>
                 <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-100 ${
                       ['bg-blue-400', 'bg-indigo-400', 'bg-slate-400'][i-1]
                     }`}>
                       {['A', 'J', 'M'][i-1]}
                     </div>
                   ))}
                   <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                     +4
                   </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <p className="text-slate-400">Nenhum aviso no mural ainda.</p>
        </div>
      )}
    </div>
  );
};

export default Mural;
