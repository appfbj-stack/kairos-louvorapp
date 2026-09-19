
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, AlignLeft, Users, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EventType, PresenceStatus, ScaleEntry, Event } from '../types';

const NewEvent: React.FC = () => {
  const navigate = useNavigate();
  const { users, addEvent } = useData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: EventType.SERVICE,
    date: '',
    time: '',
    location: 'Santuário Principal',
    observations: '',
  });

  const [scale, setScale] = useState<ScaleEntry[]>([]);

  const updateMemberStatus = (user: typeof users[0], status: PresenceStatus | null) => {
    if (status === null) {
      setScale(scale.filter(s => s.userId !== user.id));
    } else {
      const exists = scale.find(s => s.userId === user.id);
      if (exists) {
        setScale(scale.map(s => s.userId === user.id ? { ...s, status } : s));
      } else {
        setScale([...scale, {
          userId: user.id,
          userName: user.name,
          function: user.function,
          status: status
        }]);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
      scale
    };

    setTimeout(() => {
      addEvent(newEvent);
      setLoading(false);
      navigate('/agenda');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate('/agenda')}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Novo Evento</h2>
          <p className="text-slate-500 text-sm">Organize um novo culto ou ensaio.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Título do Evento</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Culto de Domingo - Manhã"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
              <select 
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium appearance-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as EventType })}
              >
                <option value={EventType.SERVICE}>Culto</option>
                <option value={EventType.REHEARSAL}>Ensaio</option>
                <option value={EventType.SPECIAL}>Especial</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Local</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="date" 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Horário</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="time" 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <AlignLeft size={16} /> Observações
            </label>
            <textarea 
              rows={3}
              placeholder="Ex: Trazer instrumentos extras, ensaiar a ponte da música X..."
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium resize-none"
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
            />
          </div>
        </section>

        {/* Scale Section */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-slate-400" /> Escalar Equipe
            </h4>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
              {scale.length} Membros
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {users.map(user => {
              const scaledMember = scale.find(s => s.userId === user.id);
              const isSelected = !!scaledMember;
              
              return (
                <div
                  key={user.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isSelected 
                    ? 'bg-white border-blue-500 shadow-lg shadow-blue-50' 
                    : 'bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {user.function}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => updateMemberStatus(user, scaledMember?.status === PresenceStatus.PENDING ? null : PresenceStatus.PENDING)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        scaledMember?.status === PresenceStatus.PENDING
                        ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-amber-200 hover:text-amber-500'
                      }`}
                    >
                      P
                    </button>

                    <button
                      type="button"
                      onClick={() => updateMemberStatus(user, scaledMember?.status === PresenceStatus.CONFIRMED ? null : PresenceStatus.CONFIRMED)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        scaledMember?.status === PresenceStatus.CONFIRMED
                        ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-100'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-green-200 hover:text-green-600'
                      }`}
                    >
                      C
                    </button>

                    <button
                      type="button"
                      onClick={() => updateMemberStatus(user, scaledMember?.status === PresenceStatus.DECLINED ? null : PresenceStatus.DECLINED)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        scaledMember?.status === PresenceStatus.DECLINED
                        ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-100'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500'
                      }`}
                    >
                      R
                    </button>
                    
                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => updateMemberStatus(user, null)}
                        className="ml-2 p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/agenda')}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Check size={20} /> Salvar Evento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewEvent;
