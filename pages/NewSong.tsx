import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Youtube, Link, AlignLeft, Check, Cloud, ListChecks, Save, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ReferencePlayer } from '../components/ReferencePlayer';
import { ChordProEditor } from '../components/ChordProEditor';
import { ArrangementEditor } from '../components/ArrangementEditor';

/**
 * Gera a URL de busca no Vagalume para a música/artista atual.
 */
const getVagalumeUrl = (song: { title: string; artist: string }) => {
  const query = `${song.title} ${song.artist}`
    .replace(/[^\wÀ-ÿ\s]/g, '')
    .replace(/\s+/g, '+')
    .trim();
  return `https://www.vagalume.com.br/search?q=${query}`;
};

const NewSong: React.FC = () => {
  const navigate = useNavigate();
  const { addSong } = useData();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    key: 'A',
    lyrics: '',
    arrangement: '',
    youtubeUrl: '',
    driveUrl: '',
    audioUrl: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newSong = {
      id: Date.now().toString(),
      ...formData,
    };

    addSong(newSong);

    setTimeout(() => {
      setLoading(false);
      navigate('/repertorio');
    }, 400);
  };

  const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/repertorio')}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Nova Música</h2>
          <p className="text-slate-500 text-sm">Adicione uma canção ao repertório oficial com cifras e arranjo.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Identificação + Tom */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Music size={14} /> Identificação
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título da Música</label>
              <div className="relative">
                <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="Ex: A Casa é Sua"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-semibold"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Artista / Ministério</label>
              <input
                required
                type="text"
                placeholder="Ex: Casa Worship"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-semibold"
                value={formData.artist}
                onChange={e => setFormData({ ...formData, artist: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tom Oficial do Ministério</label>
            <div className="flex flex-wrap gap-2">
              {musicalKeys.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFormData({ ...formData, key: k })}
                  className={`w-12 h-12 rounded-xl font-bold transition-all border ${
                    formData.key === k
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Links + Player */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Link size={14} /> Links e Materiais de Apoio
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Youtube size={12} className="text-red-500" /> Link do YouTube
              </label>
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                <input
                  type="url"
                  placeholder="https://youtube.com/..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 text-sm font-semibold"
                  value={formData.youtubeUrl}
                  onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Cloud size={12} className="text-blue-500" /> Link de Áudio (Nuvem / MP3)
              </label>
              <div className="relative">
                <Cloud className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input
                  type="url"
                  placeholder="Google Drive, Dropbox, MP3..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 text-sm font-semibold"
                  value={formData.audioUrl}
                  onChange={e => setFormData({ ...formData, audioUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Link size={12} className="text-slate-500" /> Link da Cifra Externa
              </label>
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="url"
                  placeholder="CifraClub, Drive..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 text-sm font-semibold"
                  value={formData.driveUrl}
                  onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Botão Vagalume - referência de letra/cifra */}
          {formData.title && formData.artist && (
            <a
              href={getVagalumeUrl(formData)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl hover:from-orange-100 hover:to-amber-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-black text-sm">
                  V
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">Buscar letra no Vagalume</p>
                  <p className="text-[10px] text-slate-500">Abre em nova aba · referência oficial</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
            </a>
          )}

          {(formData.youtubeUrl || formData.audioUrl) && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Pré-visualização do Player Integrado</span>
              <ReferencePlayer
                youtubeUrl={formData.youtubeUrl}
                audioUrl={formData.audioUrl}
                title={formData.title || 'Nova Música (Sem Título)'}
                artist={formData.artist || 'Artista'}
              />
            </div>
          )}
        </section>

        {/* 3. Letra + Cifras (ChordPro) */}
        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <AlignLeft size={14} /> Letra com Cifras (ChordPro)
          </h4>
          <ChordProEditor
            value={formData.lyrics}
            onChange={lyrics => setFormData({ ...formData, lyrics })}
            currentKey={formData.key}
          />
        </section>

        {/* 4. Arranjo / Notas Ministeriais */}
        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <ListChecks size={14} /> Arranjo / Notas para a Equipe
          </h4>
          <ArrangementEditor
            value={formData.arrangement || ''}
            onChange={arrangement => setFormData({ ...formData, arrangement })}
          />
        </section>

        {/* 5. Ações */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pb-2">
          <button
            type="button"
            onClick={() => navigate('/repertorio')}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-white border border-slate-200 transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check size={20} /> Salvar Música no Repertório
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewSong;
