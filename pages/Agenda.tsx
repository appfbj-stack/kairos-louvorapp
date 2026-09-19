
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, Clock, Users, ChevronRight, Check, X, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PresenceStatus } from '../types';
import { useData } from '../context/DataContext';

const Agenda: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useData();

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Agenda</h2>
          <p className="text-slate-500">Cultos, ensaios e reuniões.</p>
        </div>
        <button 
          onClick={() => navigate('/agenda/novo')}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Evento</span>
        </button>
      </header>

      <div className="space-y-6">
        {sortedEvents.map(event => (
          <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    event.type === 'CULTO' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {event.type}
                  </span>
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="text-slate-500 text-sm font-medium">
                    {format(new Date(event.date), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{event.title}</h3>
              </div>
              
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={16} />
                    <span className="text-sm font-medium">{event.time}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{event.location}</span>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Users size={16} /> Escala
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {event.scale.map((member, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{member.userName}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{member.function}</p>
                    </div>
                    <div>
                      {member.status === PresenceStatus.CONFIRMED && (
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      {member.status === PresenceStatus.DECLINED && (
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <X size={14} strokeWidth={3} />
                        </div>
                      )}
                      {member.status === PresenceStatus.PENDING && (
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertCircle size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {event.observations && (
              <div className="px-6 py-4 border-t border-slate-50 flex items-start gap-3">
                 <AlertCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
                 <p className="text-sm text-slate-600 italic">"{event.observations}"</p>
              </div>
            )}
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">Nenhum evento cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agenda;
