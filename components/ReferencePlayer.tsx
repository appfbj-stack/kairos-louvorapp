import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Youtube, Music, Sparkles, AlertCircle } from 'lucide-react';

interface ReferencePlayerProps {
  youtubeUrl?: string;
  audioUrl?: string;
  title?: string;
  artist?: string;
  className?: string;
}

// Extract YouTube ID and return embeddable URL
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// Convert common cloud sharing links (Google Drive, Dropbox) into raw streamable URLs
export function getDirectAudioUrl(url: string): string {
  if (!url) return '';
  
  // Google Drive link conversion
  const gdFileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdFileMatch && gdFileMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${gdFileMatch[1]}`;
  }
  
  const gdIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && gdIdMatch && gdIdMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${gdIdMatch[1]}`;
  }
  
  // Dropbox link conversion
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?dl=1');
  }

  return url;
}

export const ReferencePlayer: React.FC<ReferencePlayerProps> = ({
  youtubeUrl = '',
  audioUrl = '',
  title = '',
  artist = '',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'youtube'>('audio');
  
  // Custom Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const directAudioUrl = getDirectAudioUrl(audioUrl);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeUrl);

  // Set default tab based on what urls are present
  useEffect(() => {
    if (audioUrl) {
      setActiveTab('audio');
    } else if (youtubeUrl) {
      setActiveTab('youtube');
    }
  }, [audioUrl, youtubeUrl]);

  // Pause audio when switching tabs
  useEffect(() => {
    if (activeTab !== 'audio' && isPlaying) {
      pauseAudio();
    }
  }, [activeTab]);

  // Reset audio player when URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error('Audio playback error:', err);
        setAudioError(true);
      });
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    setAudioError(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  // Format time in mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const hasAudio = !!audioUrl;
  const hasYoutube = !!youtubeEmbedUrl;

  if (!hasAudio && !hasYoutube) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center text-slate-400 text-xs">
        Nenhum áudio ou vídeo de referência anexado. Edite a música para adicionar.
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm ${className}`}>
      {/* Tab Header if both sources exist */}
      {hasAudio && hasYoutube && (
        <div className="flex border-b border-slate-50 bg-slate-50/50 p-1">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-2xl transition-all ${
              activeTab === 'audio'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Music size={14} /> Áudio de Referência (Nuvem)
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-2xl transition-all ${
              activeTab === 'youtube'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Youtube size={14} /> Vídeo de Referência (YouTube)
          </button>
        </div>
      )}

      <div className="p-6">
        {activeTab === 'audio' && hasAudio && (
          <div className="space-y-4">
            {/* Hidden native HTML5 audio */}
            <audio
              ref={audioRef}
              src={directAudioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleAudioEnded}
              onError={() => setAudioError(true)}
            />

            <div className="flex items-center gap-4">
              {/* Play Button */}
              <button
                onClick={togglePlay}
                disabled={audioError}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 shrink-0 ${
                  audioError
                    ? 'bg-slate-300 shadow-none cursor-not-allowed'
                    : isPlaying
                      ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                      : 'bg-slate-900 shadow-slate-200 hover:bg-black'
                }`}
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>

              {/* Title & Artist info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Cloud Audio</span>
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-0.5 bg-blue-500 rounded-full animate-pulse h-1" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                      <div className="w-0.5 bg-blue-500 rounded-full animate-pulse h-3" style={{ animationDelay: '150ms', animationDuration: '0.4s' }} />
                      <div className="w-0.5 bg-blue-500 rounded-full animate-pulse h-2" style={{ animationDelay: '300ms', animationDuration: '0.5s' }} />
                    </div>
                  )}
                </div>
                <h5 className="font-bold text-slate-800 text-sm truncate mt-0.5">{title || 'Áudio de Referência'}</h5>
                <p className="text-slate-400 text-xs truncate leading-none mt-1">{artist || 'Ministério de Louvor'}</p>
              </div>
            </div>

            {/* Error Message */}
            {audioError && (
              <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Erro de Carregamento.</span> O arquivo de áudio não pôde ser reproduzido diretamente. Verifique se o link é público ou tente baixar diretamente.
                </div>
              </div>
            )}

            {/* Seek Bar and volume row */}
            {!audioError && (
              <div className="space-y-2 pt-2">
                {/* Timeline */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold font-mono text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-slate-100 hover:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[10px] font-bold font-mono text-slate-400 w-10 text-left">{formatTime(duration)}</span>
                </div>

                {/* Volume slider */}
                <div className="flex items-center justify-end gap-2 pr-1 pt-1">
                  <button onClick={toggleMute} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* YouTube Video Embed Player */}
        {((activeTab === 'youtube' && hasYoutube) || (!hasAudio && hasYoutube)) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">YouTube Embed</span>
              <span className="text-xs text-slate-400 font-medium truncate">{title}</span>
            </div>
            {youtubeEmbedUrl ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-950">
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube reference player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 text-xs p-4 rounded-2xl">
                URL do YouTube inválida ou não pôde ser carregada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
