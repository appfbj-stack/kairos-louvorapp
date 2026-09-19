import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Tv, 
  Activity, 
  HelpCircle, 
  Play, 
  Pause, 
  Youtube, 
  Plus, 
  Trash2, 
  Heart, 
  Volume2, 
  ChevronRight, 
  BookOpen, 
  Sparkles,
  Award,
  Music,
  Check,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

interface VocalLesson {
  id: string;
  title: string;
  channel: string;
  youtubeUrl: string;
  duration: string;
  category: 'Técnica Vocal' | 'Backing Vocal' | 'Saúde Vocal' | 'Ministério';
  description: string;
}

const DEFAULT_LESSONS: VocalLesson[] = [
  {
    id: 'vl1',
    title: 'Como Fazer Backing Vocal e Segunda Voz no Louvor',
    channel: 'Canal de Canto Ministerial',
    youtubeUrl: 'https://www.youtube.com/watch?v=N1e_n00wWkE',
    duration: '15 min',
    category: 'Backing Vocal',
    description: 'Aprenda os segredos para encontrar a terça e a quinta acima da melodia principal para criar harmonias perfeitas de backing vocal.'
  },
  {
    id: 'vl2',
    title: 'Exercício de Aquecimento Vocal Rápido antes de Cantar',
    channel: 'Escola de Voz Louvor',
    youtubeUrl: 'https://www.youtube.com/watch?v=2_Wf10vskm0',
    duration: '8 min',
    category: 'Técnica Vocal',
    description: 'Um guia prático com lip rolls (brrr), humming (mmmm) e trinados para lubrificar as cordas vocais antes de subir ao altar.'
  },
  {
    id: 'vl3',
    title: 'Respiração Diafragmática e Apoio Vocal para Cantores',
    channel: 'Técnica de Voz e Respiração',
    youtubeUrl: 'https://www.youtube.com/watch?v=5Vd2gV0XzI0',
    duration: '12 min',
    category: 'Técnica Vocal',
    description: 'Como respirar corretamente pelo diafragma e usar o apoio abdominal para sustentar notas longas e potentes sem forçar a garganta.'
  },
  {
    id: 'vl4',
    title: 'Como usar o Microfone no Altar e Postura Ministerial',
    channel: 'Adoração e Dinâmica Vocal',
    youtubeUrl: 'https://www.youtube.com/watch?v=N08C3O11Cio',
    duration: '10 min',
    category: 'Ministério',
    description: 'Dicas práticas de posicionamento do microfone (distância), dinâmica de volume para graves e agudos, e postura espiritual no culto.'
  },
  {
    id: 'vl5',
    title: 'Higiene e Cuidados com a Voz para Cantores de Louvor',
    channel: 'Saúde Vocal Brasil',
    youtubeUrl: 'https://www.youtube.com/watch?v=FwV2m-wG5w8',
    duration: '9 min',
    category: 'Saúde Vocal',
    description: 'A importância da hidratação constante, o papel da maçã na salivação, evitar choques de temperatura e alimentos que prejudicam a voz antes do culto.'
  }
];

// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
    if (urlObj.hostname.includes('youtu.be')) {
      const v = urlObj.pathname.substring(1);
      if (v && v.length === 11) return v;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export const VocalTraining: React.FC = () => {
  const { users, currentUserId } = useData();
  const currentUser = users.find(u => u.id === currentUserId);
  const isLeader = currentUser?.role === UserRole.LEADER;

  const [activeTab, setActiveTab] = useState<'lessons' | 'warmups' | 'tips'>('lessons');
  const [lessons, setLessons] = useState<VocalLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<VocalLesson | null>(null);

  // New lesson form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newCategory, setNewCategory] = useState<'Técnica Vocal' | 'Backing Vocal' | 'Saúde Vocal' | 'Ministério'>('Técnica Vocal');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Audio Warmup State
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [warmupType, setWarmupType] = useState<'lip_rolls' | 'humming' | 'vocals'>('lip_rolls');
  const [currentNoteName, setCurrentNoteName] = useState<string>('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(300); // ms per note
  const warmupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load lessons from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('louvor_vocal_lessons');
    let loaded: VocalLesson[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
        if (!Array.isArray(loaded)) {
          loaded = DEFAULT_LESSONS;
        } else {
          let mutated = false;
          DEFAULT_LESSONS.forEach(def => {
            if (!loaded.some(l => l.id === def.id || l.title === def.title)) {
              loaded.push(def);
              mutated = true;
            }
          });
          if (mutated) {
            localStorage.setItem('louvor_vocal_lessons', JSON.stringify(loaded));
          }
        }
      } catch (e) {
        loaded = DEFAULT_LESSONS;
      }
    } else {
      loaded = DEFAULT_LESSONS;
      localStorage.setItem('louvor_vocal_lessons', JSON.stringify(DEFAULT_LESSONS));
    }
    setLessons(loaded);
    if (loaded.length > 0) {
      setSelectedLesson(loaded[0]);
    }
  }, []);

  // Save lessons to localStorage helper
  const saveLessons = (updatedLessons: VocalLesson[]) => {
    setLessons(updatedLessons);
    localStorage.setItem('louvor_vocal_lessons', JSON.stringify(updatedLessons));
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle || !newUrl) {
      setFormError('Por favor, preencha o título e o link do YouTube.');
      return;
    }

    const videoId = getYouTubeId(newUrl);
    if (!videoId) {
      setFormError('Link do YouTube inválido. Use um formato como: https://www.youtube.com/watch?v=... ou https://youtu.be/...');
      return;
    }

    const newLesson: VocalLesson = {
      id: 'vl_' + Date.now(),
      title: newTitle,
      channel: newChannel || 'Ministério',
      youtubeUrl: newUrl,
      duration: newDuration || '10 min',
      category: newCategory,
      description: newDescription || 'Sem descrição.'
    };

    const updated = [newLesson, ...lessons];
    saveLessons(updated);

    // Reset Form
    setNewTitle('');
    setNewChannel('');
    setNewUrl('');
    setNewDuration('');
    setNewDescription('');
    setShowAddForm(false);
  };

  const handleDeleteLesson = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza de que deseja remover esta vídeo-aula?')) {
      const updated = lessons.filter(l => l.id !== id);
      saveLessons(updated);
      if (selectedLesson?.id === id) {
        setSelectedLesson(null);
      }
    }
  };

  // WEB AUDIO SYNTHESIZER FOR VOCAL WARMUPS
  const playScaleNote = (frequency: number, durationSeconds: number, type: 'sine' | 'triangle' | 'sawtooth') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Smooth attack and release to avoid clicks
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds - 0.05); // Decay/Sustain

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationSeconds);
    } catch (err) {
      console.error('Failed to play synthesizer note:', err);
    }
  };

  // Stop running scale loop
  const stopWarmup = () => {
    setIsWarmingUp(false);
    setCurrentNoteName('');
    if (warmupTimeoutRef.current) {
      clearTimeout(warmupTimeoutRef.current);
      warmupTimeoutRef.current = null;
    }
  };

  // Run scale pattern loop
  const startWarmup = () => {
    if (isWarmingUp) {
      stopWarmup();
      return;
    }

    setIsWarmingUp(true);

    // Major scale intervals relative to tonic frequency
    const intervals = [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0];
    const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C+', 'B', 'A', 'G', 'F', 'E', 'D', 'C'];
    
    // Choose base frequency depending on warmup type
    // lip_rolls: medium low, humming: very low, vocals: medium/high
    let baseFreq = 130.81; // C3 (Male base / low vocal)
    let synthType: 'sine' | 'triangle' | 'sawtooth' = 'triangle';

    if (warmupType === 'humming') {
      baseFreq = 110.00; // A2 (Very cozy, resonant)
      synthType = 'sine'; // Super pure sine wave
    } else if (warmupType === 'vocals') {
      baseFreq = 196.00; // G3 (Higher range for open vowels)
      synthType = 'triangle'; // Flutey, rich in odd harmonics
    }

    let noteIndex = 0;
    let transpositionStep = 0; // ascending keys

    const playNext = () => {
      if (noteIndex >= intervals.length) {
        // Finished one full scale! Let's transpose UP by a semitone (half-step)
        // limit to 4 transpositions so it doesn't get ridiculously high
        transpositionStep = (transpositionStep + 1) % 5;
        noteIndex = 0;
      }

      // Calculate semitone frequency: f = base * 2 ^ (n/12)
      const semitonesFromBase = intervals[noteIndex] + transpositionStep;
      const frequency = baseFreq * Math.pow(2, semitonesFromBase / 12);
      
      const isAscending = noteIndex < 8;
      setCurrentNoteName(`${noteNames[noteIndex]} (${transpositionStep > 0 ? `+${transpositionStep} tom` : 'Original'})`);

      // Play note
      playScaleNote(frequency, 0.4, synthType);

      noteIndex++;
      
      // Schedule next note
      warmupTimeoutRef.current = setTimeout(playNext, 450);
    };

    playNext();
  };

  useEffect(() => {
    return () => {
      if (warmupTimeoutRef.current) {
        clearTimeout(warmupTimeoutRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Mic className="text-blue-600" size={32} /> Capacitação Vocal & Backing Vocal
          </h2>
          <p className="text-slate-500">Aulas recomendadas, guias de harmonia vocal e aquecimentos integrados.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 self-start md:self-auto border border-slate-200/50 shadow-sm">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'lessons'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tv size={14} /> Vídeo-Aulas
          </button>
          <button
            onClick={() => setActiveTab('warmups')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'warmups'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity size={14} /> Aquecimento Vocal
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === 'tips'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={14} /> Dicas e Saúde
          </button>
        </div>
      </header>

      {/* SECTION 1: VIDEO LESSONS */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player / Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {selectedLesson ? (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm p-6 space-y-4">
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-md">
                  {getYouTubeId(selectedLesson.youtubeUrl) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(selectedLesson.youtubeUrl)}?autoplay=1`}
                      title={selectedLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      URL de vídeo inválida
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-sans">
                      {selectedLesson.category}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{selectedLesson.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">{selectedLesson.title}</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1">Canal: {selectedLesson.channel}</p>
                  <p className="text-slate-600 text-sm leading-relaxed mt-4 whitespace-pre-wrap">{selectedLesson.description}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50/50 to-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center h-[350px] flex flex-col items-center justify-center">
                <Youtube size={48} className="text-slate-300 mb-4" />
                <h4 className="font-bold text-slate-700 text-lg">Nenhuma aula reproduzindo</h4>
                <p className="text-slate-400 text-xs mt-1 max-w-sm">
                  Selecione uma das vídeo-aulas da lista ao lado para começar seu estudo vocal integrado.
                </p>
              </div>
            )}

            {/* Vocalist Goal Encouragement */}
            <div className="bg-gradient-to-tr from-slate-900 to-blue-950 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.08]">
                <Award size={150} />
              </div>
              <div className="relative max-w-lg space-y-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-wider rounded-md border border-blue-500/10">
                  Compromisso Ministerial
                </span>
                <h4 className="text-2xl font-serif font-bold text-blue-300">A Excelência do Canto</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  "Cantai-lhe um cântico novo; tocai bem e com júbilo." Salmos 33:3. Nosso louvor deve ser sincero em espírito, mas também trabalhado com excelência técnica para guiar a igreja com segurança.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Estude semanalmente com sua equipe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Lesson List / Right Side */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Tv size={16} className="text-blue-600" /> Aulas Recomendadas
                </h4>
                {isLeader && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-blue-600 transition-colors"
                    title="Adicionar Vídeo-Aula"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>

              {/* Add Custom Lesson Form */}
              {showAddForm && (
                <form onSubmit={handleAddLesson} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3 animate-in slide-in-from-top-4 duration-300">
                  <h5 className="text-xs font-black text-slate-600 uppercase tracking-wider">Nova Vídeo-Aula</h5>
                  {formError && (
                    <div className="flex gap-1.5 p-2 bg-red-50 text-red-700 rounded-lg text-[10px]">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Título</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold"
                      placeholder="Ex: Como respirar de forma correta"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Canal / Autor</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                        placeholder="Canal do YouTube"
                        value={newChannel}
                        onChange={e => setNewChannel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Duração</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                        placeholder="Ex: 10 min"
                        value={newDuration}
                        onChange={e => setNewDuration(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Categoria</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                    >
                      <option value="Técnica Vocal">Técnica Vocal</option>
                      <option value="Backing Vocal">Backing Vocal</option>
                      <option value="Saúde Vocal">Saúde Vocal</option>
                      <option value="Ministério">Ministério</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Link do Vídeo</label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newUrl}
                      onChange={e => setNewUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Breve Descrição</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none"
                      placeholder="Explicação rápida do vídeo..."
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Salvar Aula
                  </button>
                </form>
              )}

              {/* Video Lessons Lists */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                {lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-3.5 border rounded-2xl cursor-pointer transition-all group relative flex gap-3.5 items-center ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-red-50 text-red-500'
                    }`}>
                      <Youtube size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        {lesson.category}
                      </span>
                      <h5 className="font-bold text-xs leading-snug truncate group-hover:text-blue-600 mt-0.5">
                        {lesson.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{lesson.channel}</p>
                    </div>
                    {isLeader && (
                      <button
                        onClick={(e) => handleDeleteLesson(lesson.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all absolute right-2 top-1/2 -translate-y-1/2"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: VOCAL WARMUPS & AUDIO SYNTHESIZER */}
      {activeTab === 'warmups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Synthesizer Control Panel */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">Piano de Aquecimento Vocal</h4>
                <p className="text-slate-400 text-xs font-medium">Acompanhe as escalas de afinação geradas pelo app.</p>
              </div>
            </div>

            {/* Vocal warmup select card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => { stopWarmup(); setWarmupType('lip_rolls'); }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  warmupType === 'lip_rolls'
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10'
                    : 'bg-slate-50 border-slate-200/50 hover:bg-slate-100'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h5 className="font-bold text-xs text-slate-800">Vibração de Lábios</h5>
                <p className="text-[10px] text-slate-400 mt-1">Sopro de Lábios (Brrr) para destravar a musculatura e aquecer as cordas.</p>
              </button>

              <button
                onClick={() => { stopWarmup(); setWarmupType('humming'); }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  warmupType === 'humming'
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10'
                    : 'bg-slate-50 border-slate-200/50 hover:bg-slate-100'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h5 className="font-bold text-xs text-slate-800">Humming ("Mmmm")</h5>
                <p className="text-[10px] text-slate-400 mt-1">Sons nasais de boca fechada para buscar ressonância facial (Máscara vocal).</p>
              </button>

              <button
                onClick={() => { stopWarmup(); setWarmupType('vocals'); }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  warmupType === 'vocals'
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10'
                    : 'bg-slate-50 border-slate-200/50 hover:bg-slate-100'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h5 className="font-bold text-xs text-slate-800">Vogais Abertas</h5>
                <p className="text-[10px] text-slate-400 mt-1">Exercícios com Ma-Me-Mi-Mo-Mu para trabalhar a afinação e projeção.</p>
              </button>
            </div>

            {/* Simulated Live Instrument UI */}
            <div className="bg-slate-950 p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] shadow-inner">
              {/* Background ambient lighting */}
              <div className={`absolute w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transition-all ${isWarmingUp ? 'scale-150 animate-pulse' : ''}`} />

              <div className="relative text-center z-10 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sintetizador Integrado</span>
                <div className="text-4xl font-mono font-black text-white h-10 tracking-widest">
                  {currentNoteName || 'Aguardando...'}
                </div>
                {isWarmingUp && (
                  <div className="flex gap-1 justify-center items-end h-4 mt-2">
                    <div className="w-1 bg-blue-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0s' }} />
                    <div className="w-1 bg-blue-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 bg-blue-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 bg-blue-400 rounded-full animate-bounce h-1" style={{ animationDelay: '0.3s' }} />
                  </div>
                )}
              </div>

              {/* Playback Key Indicators */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between px-2 text-[8px] font-mono text-slate-600">
                <span>C3</span>
                <span>E3</span>
                <span>G3</span>
                <span>C4</span>
                <span>E4</span>
                <span>G4</span>
              </div>
            </div>

            {/* Run Button */}
            <div className="flex gap-4">
              <button
                onClick={startWarmup}
                className={`flex-1 py-4 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isWarmingUp
                    ? 'bg-red-600 shadow-red-100 hover:bg-red-700'
                    : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
                }`}
              >
                {isWarmingUp ? (
                  <>
                    <Pause size={18} fill="currentColor" /> Parar Exercício
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" className="ml-0.5" /> Iniciar Escala de Aquecimento
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Training Instructions */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={16} className="text-blue-600" /> Como Praticar
            </h4>
            <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/50">
                <span className="font-bold text-slate-700 block mb-1">Passo 1: Postura</span>
                Mantenha a coluna reta, ombros relaxados e pés firmes no chão. Evite levantar o queixo para cantar notas agudas.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/50">
                <span className="font-bold text-slate-700 block mb-1">Passo 2: Vibração de Lábios</span>
                Deixe os lábios bem soltos e assopre imitando um motor. Faça o exercício acompanhando as notas do teclado.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/50">
                <span className="font-bold text-slate-700 block mb-1">Passo 3: Projeção</span>
                Ao passar para a escala de vogais, tente projetar a voz na "máscara" facial (evite garganta travada). Sorrir de leve ajuda a clarear os agudos!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TIPS & GLOSSARY */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Health and Prep Card */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Heart className="text-red-500 animate-pulse" size={24} /> Saúde & Higiene Vocal
            </h4>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  H
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800">Hidratação é Tudo!</h5>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Beba água em temperatura ambiente constantemente. As cordas vocais precisam de hidratação sistêmica (que leva cerca de 20 minutos para atingir a garganta). Não adianta beber água só na hora de cantar!
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                  M
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800">O Poder da Maçã</h5>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    A maçã tem propriedades adstringentes que limpam a saliva grossa da garganta e boca, ajudando a articular as palavras de forma mais límpida e leve. Tenha uma maçã à mão antes do louvor!
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                  A
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800">Alimentos a Evitar</h5>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Evite chocolate, derivados de leite, café e refrigerantes antes do culto. Eles geram pigarro e salivação viscosa, dificultando a agilidade das notas. Bebidas geladas contraem os músculos, evite-as!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vocal Harmony Card */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Music className="text-blue-600" size={24} /> Regras de Ouro do Backing Vocal
            </h4>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-1.5">1. Siga o Líder</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  O backing vocal não deve sobressair ao ministro principal. Seu papel é encorpar, criar harmonia e sustentação. Escute sempre o ministro e controle o volume do seu microfone.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-1.5">2. Ataque e Corte</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Todos do backing vocal devem respirar e pronunciar as palavras no MESMO tempo. Começos e finais de frases precisam ser sincronizados com precisão cirúrgica.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-1.5">3. Divisão de Naipes</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Geralmente, Sopranos cantam a voz principal ou o agudo (terça acima), Contraltos fazem o médio/baixo (terça abaixo ou quinta), e Tenores preenchem o intermediário. Conheça sua tessitura!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocalTraining;
