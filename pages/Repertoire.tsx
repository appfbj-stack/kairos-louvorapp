
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Minus,
  Youtube, 
  FileText, 
  ChevronRight, 
  X, 
  Music, 
  Mic2, 
  Copy,
  Check,
  Pencil,
  RefreshCcw,
  Share2,
  ExternalLink,
  Sparkles,
  ListChecks,
  AlignLeft,
  Globe
} from 'lucide-react';
import { Song } from '../types';
import { useData } from '../context/DataContext';
import { GeminiService } from '../services/geminiService';
import { ChordDictionary } from '../components/ChordDictionary';
import { getHarmonicField } from '../data/chords';
import { ReferencePlayer } from '../components/ReferencePlayer';
import { ChordProRenderer } from '../components/ChordProRenderer';
import { parseArrangement } from '../components/ArrangementEditor';

/**
 * Gera a URL de busca no Vagalume para uma música/artista.
 * Abre a página de resultados onde o usuário pode encontrar a letra/cifra original.
 */
export const getVagalumeUrl = (song: Song) => {
  const query = `${song.title} ${song.artist}`
    .replace(/[^\wÀ-ÿ\s]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '+')
    .trim();
  return `https://www.vagalume.com.br/search?q=${query}`;
};

/**
 * Componente somente-leitura que renderiza o arranjo formatado.
 * Usado dentro do modal de detalhes da música.
 */
const ArrangementView: React.FC<{ content?: string }> = ({ content }) => {
  const sections = parseArrangement(content || '');
  if (sections.length === 0) {
    return (
      <div className="text-slate-400 italic text-sm p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
        🎼 Nenhum arranjo cadastrado ainda.<br/>
        O líder pode adicionar em <em>Editar Música → Arranjo</em>.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {sections.map((s, idx) => (
        <div key={idx} className="border-l-4 border-blue-500 pl-4 py-1 bg-white rounded-r-2xl pr-4 shadow-sm">
          <div className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">
            {s.title}
          </div>
          <ul className="space-y-1.5">
            {s.bullets.map((b, bidx) => (
              <li key={bidx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 font-bold">▸</span>
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const Repertoire: React.FC = () => {
  const navigate = useNavigate();
  const { songs, updateSong } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [copied, setCopied] = useState(false);
  const [isChangingKey, setIsChangingKey] = useState(false);
  const [isTransposingAI, setIsTransposingAI] = useState(false);
  const [isChordDictionaryOpen, setIsChordDictionaryOpen] = useState(false);
  const [selectedChordToView, setSelectedChordToView] = useState<string>('C');
  const [detailTab, setDetailTab] = useState<'lyrics' | 'arrangement'>('lyrics');

  const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const gemini = GeminiService.getInstance();

  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.key.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesKey = selectedKey === '' || song.key.toLowerCase() === selectedKey.toLowerCase();
    
    return matchesSearch && matchesKey;
  });

  const handleCopyLyrics = (lyrics: string) => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangeKey = (newKey: string) => {
    if (!selectedSong) return;
    const updated = { ...selectedSong, key: newKey };
    updateSong(updated);
    setSelectedSong(updated);
    setIsChangingKey(false);
  };

  const shiftKey = (direction: 'up' | 'down') => {
    if (!selectedSong) return;
    const currentIndex = musicalKeys.indexOf(selectedSong.key);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'up') {
      nextIndex = (currentIndex + 1) % musicalKeys.length;
    } else {
      nextIndex = (currentIndex - 1 + musicalKeys.length) % musicalKeys.length;
    }

    const newKey = musicalKeys[nextIndex];
    handleChangeKey(newKey);
  };

  const handleAITranspose = async () => {
    if (!selectedSong) return;
    
    // Find original song to get the original key (we'd need a way to track the source key, 
    // for now we'll use a prompt-based approach or assume the current displayed key is the target)
    // To make this robust, we'd ideally know the "Original Key" vs "Current Key".
    // For this MVP, we prompt the user to confirm.
    
    const originalSong = songs.find(s => s.id === selectedSong.id);
    if (!originalSong) return;

    setIsTransposingAI(true);
    try {
      // We use the current key of the original object in context as the "from" 
      // but if the user just clicked [+] then the context is updated.
      // This is a simple implementation:
      const newLyrics = await gemini.transposeLyrics(selectedSong.lyrics, "anterior", selectedSong.key);
      const updated = { ...selectedSong, lyrics: newLyrics };
      updateSong(updated);
      setSelectedSong(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTransposingAI(false);
    }
  };

  const handleShare = async (song: Song, type: 'YouTube' | 'Cifra') => {
    const url = type === 'YouTube' 
      ? song.youtubeUrl 
      : (song.driveUrl || `https://www.google.com/search?q=cifra+${song.title.replace(/ /g, '+')}+${song.artist.replace(/ /g, '+')}`);
    
    if (!url) return;

    const shareData = {
      title: `${song.title} - ${song.artist}`,
      text: `Confira o link para a ${type === 'YouTube' ? 'referência' : 'cifra'} da música "${song.title}" de ${song.artist}:`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${url}`)}`;
      window.open(waUrl, '_blank');
    }
  };

  const getCifraUrl = (song: Song) => {
    return song.driveUrl || `https://www.google.com/search?q=cifra+${song.title.replace(/ /g, '+')}+${song.artist.replace(/ /g, '+')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800">Repertório</h2>
          <p className="text-slate-500">Músicas oficiais e materiais de estudo.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setSelectedChordToView('C'); setIsChordDictionaryOpen(true); }}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-sm"
          >
            <Music size={18} className="text-blue-600" />
            <span>Dicionário de Acordes</span>
          </button>
          <button 
            onClick={() => navigate('/repertorio/novo')}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95 text-sm"
          >
            <Plus size={20} />
            <span>Nova Música</span>
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por título, artista ou tom (ex: C, G#)..."
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filtros por Tom / Key Filter Badges */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Filtrar por Tom</span>
            {selectedKey && (
              <button 
                onClick={() => setSelectedKey('')}
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                Limpar filtro
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedKey('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedKey === ''
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todos os tons
            </button>
            {musicalKeys.map(k => {
              const songCount = songs.filter(s => s.key === k).length;
              return (
                <button
                  key={k}
                  onClick={() => setSelectedKey(k)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedKey === k
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{k}</span>
                  {songCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      selectedKey === k ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {songCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-blue-100 transition-all group relative">
            <button 
              onClick={() => navigate(`/repertorio/editar/${song.id}`)}
              className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Editar Música"
            >
              <Pencil size={18} />
            </button>

            <div className="flex items-start justify-between mb-4 mr-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{song.title}</h3>
                <p className="text-slate-500 font-medium">{song.artist}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-black shadow-sm border border-blue-100">
                <span className="text-[10px] uppercase opacity-60 leading-none mb-1">Tom</span>
                {song.key}
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <a 
                href={song.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
              >
                <Youtube size={18} /> Vídeo
              </a>
              <a 
                href={getCifraUrl(song)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <FileText size={18} /> Cifra
              </a>
            </div>

            <button 
              onClick={() => setSelectedSong(song)}
              className="w-full flex items-center justify-between py-4 px-5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
            >
              <span className="flex items-center gap-2">
                <Mic2 size={18} className="text-blue-400" /> Detalhes e Letra
              </span>
              <ChevronRight size={20} className="text-slate-400" />
            </button>
          </div>
        ))}
      </div>

      {selectedSong && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setSelectedSong(null); setIsChangingKey(false); }} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                  <Music size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{selectedSong.title}</h3>
                  <p className="text-slate-500 font-medium">{selectedSong.artist}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedSong(null); setIsChangingKey(false); }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 pb-32 space-y-8">
              {/* Botão Vagalume em destaque */}
              <a
                href={getVagalumeUrl(selectedSong)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl hover:from-orange-100 hover:to-amber-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-black text-sm">
                    V
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Buscar no Vagalume</p>
                    <p className="text-[10px] text-slate-500">Letra e cifra original de referência</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex-1 p-4 rounded-2xl border bg-slate-50 border-slate-100 flex items-center justify-between">
                    <button 
                      onClick={(e) => { e.stopPropagation(); shiftKey('down'); }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90"
                    >
                      <Minus size={16} />
                    </button>
                    <div 
                      className="text-center cursor-pointer flex-1"
                      onClick={() => setIsChangingKey(!isChangingKey)}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Tom</p>
                      <p className="text-xl font-black text-blue-600">{selectedSong.key}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); shiftKey('up'); }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsChangingKey(!isChangingKey)}
                    className="py-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1"
                  >
                    <RefreshCcw size={12} /> <span className="text-[10px] font-bold">Listar Tons</span>
                  </button>
                </div>
                
                <div className="flex flex-col gap-1">
                  <a href={selectedSong.youtubeUrl} target="_blank" className="flex-1 bg-red-50 p-3 rounded-2xl border border-red-100 text-center group hover:bg-red-100 transition-colors flex flex-col items-center justify-center">
                    <Youtube className="text-red-600 mb-1" size={20} />
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">YouTube</p>
                  </a>
                  <button onClick={() => handleShare(selectedSong, 'YouTube')} className="py-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1">
                    <Share2 size={12} /> <span className="text-[10px] font-bold">Share</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <a 
                    href={getCifraUrl(selectedSong)} 
                    target="_blank" 
                    className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center group hover:bg-slate-100 transition-colors flex flex-col items-center justify-center"
                  >
                    <FileText className="text-slate-600 mb-1" size={20} />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cifra</p>
                  </a>
                  <button onClick={() => handleShare(selectedSong, 'Cifra')} className="py-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1">
                    <Share2 size={12} /> <span className="text-[10px] font-bold">Share</span>
                  </button>
                </div>
                
                <button onClick={() => handleCopyLyrics(selectedSong.lyrics)} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center group hover:bg-blue-100 transition-colors flex flex-col items-center justify-center">
                  {copied ? <Check className="mx-auto text-green-600 mb-1" size={20} /> : <Copy className="mx-auto text-blue-600 mb-1" size={20} />}
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{copied ? 'Copiado!' : 'Letra'}</p>
                </button>
              </div>

              {/* Integrated Audio/Video Reference Player */}
              <ReferencePlayer 
                youtubeUrl={selectedSong.youtubeUrl}
                audioUrl={selectedSong.audioUrl}
                title={selectedSong.title}
                artist={selectedSong.artist}
              />

              {isChangingKey && (
                <div className="bg-slate-900 p-6 rounded-3xl animate-in zoom-in-95 duration-200">
                  <p className="text-white text-xs font-bold uppercase tracking-widest mb-4 text-center">Selecionar Novo Tom</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {musicalKeys.map(k => (
                      <button
                        key={k}
                        onClick={() => handleChangeKey(k)}
                        className={`py-3 rounded-xl font-black text-sm transition-all ${
                          selectedSong.key === k 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested chords from the song's harmonic field */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                      <Music size={14} className="text-blue-500" /> Campo Harmônico (Tom: {selectedSong.key})
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Toque em um acorde para ver a posição recomendada (violão/teclado).</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedChordToView(selectedSong.key);
                      setIsChordDictionaryOpen(true);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
                  >
                    Abrir Dicionário Geral
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {getHarmonicField(selectedSong.key).map(({ degree, chord, name }) => (
                    <button
                      key={chord}
                      onClick={() => {
                        setSelectedChordToView(chord);
                        setIsChordDictionaryOpen(true);
                      }}
                      className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200/50 hover:border-blue-200 p-3 rounded-2xl text-center transition-all group active:scale-95"
                    >
                      <span className="font-mono text-[9px] text-slate-400 font-extrabold block">{degree}</span>
                      <span className="text-base font-black text-slate-800 mt-1 block group-hover:text-blue-600">{chord}</span>
                      <span className="text-[8px] text-slate-400 font-bold block mt-0.5 truncate">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white">
                  <button
                    onClick={() => setDetailTab('lyrics')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                      detailTab === 'lyrics'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Mic2 size={14} /> Letra e Cifra
                  </button>
                  <button
                    onClick={() => setDetailTab('arrangement')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                      detailTab === 'arrangement'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <ListChecks size={14} /> Arranjo
                    {selectedSong.arrangement && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Arranjo cadastrado" />
                    )}
                  </button>
                </div>

                <div className="p-8">
                  {detailTab === 'lyrics' ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <AlignLeft size={14} /> Letra com Cifras
                        </h4>
                        <button
                          onClick={handleAITranspose}
                          disabled={isTransposingAI}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                          {isTransposingAI ? (
                            <>
                              <RefreshCcw size={12} className="animate-spin" /> Transpondo...
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} /> Transpor com IA
                            </>
                          )}
                        </button>
                      </div>
                      <ChordProRenderer source={selectedSong.lyrics} fontSize="1.05rem" />
                    </>
                  ) : (
                    <>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                        <ListChecks size={14} /> Arranjo / Notas Ministeriais
                      </h4>
                      <ArrangementView content={selectedSong.arrangement} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Floating Action Bar for Cifra */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-3">
              <a 
                href={getCifraUrl(selectedSong)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <FileText size={20} />
                <span>Abrir Cifra Completa</span>
                <ExternalLink size={14} className="opacity-60" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Chord Dictionary Modal */}
      <ChordDictionary 
        isOpen={isChordDictionaryOpen}
        onClose={() => setIsChordDictionaryOpen(false)}
        initialChord={selectedChordToView}
      />
    </div>
  );
};

export default Repertoire;
