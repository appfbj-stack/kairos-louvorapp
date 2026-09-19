
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Pin, Check, AlignLeft, Type, Send } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { useData } from '../context/DataContext';
import { Notice } from '../types';

const NewNotice: React.FC = () => {
  const navigate = useNavigate();
  const { addNotice, users, currentUserId } = useData();
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });

  const gemini = GeminiService.getInstance();
  const currentUser = users.find(u => u.id === currentUserId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newNotice: Notice = {
      id: `notice_${Date.now()}`,
      title: formData.title,
      content: formData.content,
      isPinned: formData.isPinned,
      date: new Date().toISOString().split('T')[0],
      authorName: currentUser?.name || 'Membro do Ministério'
    };

    setTimeout(() => {
      addNotice(newNotice);
      setLoading(false);
      navigate('/mural');
    }, 800);
  };

  const refineWithAI = async () => {
    if (!formData.content) return;
    setRefining(true);
    const refined = await gemini.refineAnnouncement(formData.content);
    setFormData({ ...formData, content: refined });
    setRefining(false);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate('/mural')}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Novo Aviso</h2>
          <p className="text-slate-500 text-sm">Comunique algo importante ao ministério.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Conteúdo do Aviso */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Type size={14} /> Título do Comunicado
            </label>
            <input 
              required
              type="text" 
              placeholder="Ex: Reunião de Alinhamento"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-semibold text-lg"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <AlignLeft size={14} /> Mensagem
              </label>
              <button 
                type="button"
                onClick={refineWithAI}
                disabled={refining || !formData.content}
                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-30"
              >
                {refining ? (
                  <>
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Refinando...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} /> Refinar com IA
                  </>
                )}
              </button>
            </div>
            <textarea 
              required
              rows={6}
              placeholder="Escreva aqui o que você deseja comunicar ao time..."
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 leading-relaxed resize-none"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
              className={`flex items-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all w-full md:w-auto ${
                formData.isPinned 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Pin size={18} className={formData.isPinned ? 'fill-current' : ''} />
              {formData.isPinned ? 'Aviso Fixado no Topo' : 'Fixar este aviso no topo'}
            </button>
            <p className="text-[10px] text-slate-400 mt-3 ml-1">
              Avisos fixados aparecem com destaque no Dashboard de todos os membros.
            </p>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/mural')}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Descartar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={20} /> Publicar no Mural
              </>
            )}
          </button>
        </div>
      </form>

      {/* Dica da IA */}
      <div className="mt-8 bg-indigo-50 rounded-3xl p-6 border border-indigo-100 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles size={18} className="text-indigo-600" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-indigo-900 mb-1">Dica do LouvorApp</h5>
          <p className="text-xs text-indigo-700 leading-relaxed">
            Você pode escrever apenas os pontos principais (ex: "reunião sabado 8h levar lanche") e usar o botão <strong>Refinar com IA</strong> para criar um texto completo e encorajador automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewNotice;
