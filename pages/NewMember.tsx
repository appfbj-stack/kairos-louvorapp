
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Music, Briefcase, Shield, Check } from 'lucide-react';
import { UserRole, User as UserType } from '../types';
import { useData } from '../context/DataContext';

const NewMember: React.FC = () => {
  const navigate = useNavigate();
  const { addUser } = useData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.MEMBER,
    function: '',
    instrument: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Criar objeto do novo membro
    const newMember: UserType = {
      id: Date.now().toString(),
      ...formData
    };

    // Simular delay de rede e salvar
    setTimeout(() => {
      addUser(newMember);
      setLoading(false);
      navigate('/membros');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate('/membros')}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Novo Membro</h2>
          <p className="text-slate-500 text-sm">Adicione um músico ou voluntário ao time.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <User size={14} /> Informações Pessoais
          </h4>
          
          <div className="space-y-1">
            <input 
              required
              type="text" 
              placeholder="Nome Completo"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="email" 
                placeholder="E-mail"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="tel" 
                placeholder="Telefone / WhatsApp"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Briefcase size={14} /> Atribuições no Ministério
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Função Principal</label>
              <div className="relative">
                <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Vocalista, Tecladista..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
                  value={formData.function}
                  onChange={e => setFormData({ ...formData, function: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Instrumento</label>
              <input 
                type="text" 
                placeholder="Ex: Violão, Voz..."
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium"
                value={formData.instrument}
                onChange={e => setFormData({ ...formData, instrument: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Shield size={14} /> Nível de Acesso
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: UserRole.MEMBER })}
                className={`py-4 px-4 rounded-2xl font-bold border transition-all ${
                  formData.role === UserRole.MEMBER 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}
              >
                Membro
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: UserRole.LEADER })}
                className={`py-4 px-4 rounded-2xl font-bold border transition-all ${
                  formData.role === UserRole.LEADER 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}
              >
                Líder
              </button>
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/membros')}
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
                <Check size={20} /> Cadastrar Membro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMember;
