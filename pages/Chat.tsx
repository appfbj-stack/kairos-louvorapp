import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { ChatMessage, UserRole } from '../types';
import { 
  Send, 
  Search, 
  Smile, 
  Trash2, 
  Users, 
  Sparkles, 
  Clock, 
  MessageSquare,
  Info,
  CheckCheck,
  User,
  ChevronDown
} from 'lucide-react';

const QUICK_REPLIES = [
  'Amém! 🙏',
  'Confirmado! 👍',
  'Cifra estudada! 🎸',
  'Que culto abençoado! 🙌',
  'Que horas começa o ensaio? ⏰',
  'Estou chegando! 🚗',
  'Alguma dúvida no tom? 🎶'
];

const Chat: React.FC = () => {
  const { 
    chatMessages, 
    addChatMessage, 
    clearChat, 
    users, 
    currentUserId, 
    setCurrentUserId,
    settings
  } = useData();

  const [messageText, setMessageText] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentUser = users.find(u => u.id === currentUserId);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    addChatMessage(messageText.trim());
    setMessageText('');
  };

  const handleQuickReply = (reply: string) => {
    addChatMessage(reply);
  };

  // Filter messages based on search
  const filteredMessages = chatMessages.filter(msg => {
    if (!chatSearch) return true;
    return (
      msg.content.toLowerCase().includes(chatSearch.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(chatSearch.toLowerCase())
    );
  });

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const formatDateLabel = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
      }
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div id="chat-page-root" className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-60px)] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
      
      {/* Chat Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-100">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
              Mural de Conversas
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Geral
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Users size={12} />
              {users.length} integrantes conectados
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Profile Switcher (Extremely convenient for testing!) */}
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition-all border border-slate-200"
              title="Trocar perfil para simular conversa"
            >
              <div className="w-4 h-4 rounded-full bg-blue-600 text-[8px] text-white flex items-center justify-center font-bold">
                {currentUser?.name.charAt(0)}
              </div>
              <span className="max-w-[80px] truncate">{currentUser?.name}</span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mudar Identidade</p>
                  <p className="text-xs text-slate-500">Selecione para simular outro integrante:</p>
                </div>
                <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserId(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        u.id === currentUserId 
                          ? 'bg-blue-50 text-blue-700 font-bold' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold leading-none">{u.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{u.function}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Toggle */}
          <button 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setChatSearch('');
            }}
            className={`p-2 rounded-xl transition-all ${
              showSearch 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'hover:bg-slate-100 text-slate-500 border border-transparent'
            }`}
            title="Buscar mensagens"
          >
            <Search size={18} />
          </button>

          {/* Clear Chat (For Leaders) */}
          {currentUser?.role === UserRole.LEADER && (
            <button 
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja limpar todo o histórico do chat?')) {
                  clearChat();
                }
              }}
              className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              title="Limpar histórico (Apenas Líderes)"
            >
              <Trash2 size={18} />
            </button>
          )}

          {/* Info toggle */}
          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`p-2 rounded-xl transition-all ${
              showInfoPanel 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-slate-100 text-slate-500'
            }`}
            title="Sobre este Chat"
          >
            <Info size={18} />
          </button>
        </div>
      </header>

      {/* Search Bar (Collapsible) */}
      {showSearch && (
        <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar termos, ideias ou mensagens..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs transition-all text-slate-700"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              autoFocus
            />
          </div>
          {chatSearch && (
            <button 
              onClick={() => setChatSearch('')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Chat Area Container */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Messages List Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/50 no-scrollbar"
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-8">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">
                {chatSearch ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem enviada'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {chatSearch 
                  ? 'Tente buscar por termos diferentes ou confira a ortografia.' 
                  : 'Seja o primeiro a enviar uma mensagem para alinhar o ensaio de domingo!'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isMe = msg.senderId === currentUserId;
              const showDateLabel = index === 0 || formatDateLabel(msg.timestamp) !== formatDateLabel(filteredMessages[index - 1].timestamp);

              return (
                <div key={msg.id} className="space-y-2">
                  {/* Date separator */}
                  {showDateLabel && (
                    <div className="flex justify-center my-4">
                      <span className="bg-slate-200/60 backdrop-blur-sm text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {formatDateLabel(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message structure */}
                  <div className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Avatar (Left side, only if not me) */}
                    {!isMe && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0 mb-1" title={`${msg.senderName} (${msg.senderFunction})`}>
                        {msg.senderName.charAt(0)}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[70%] space-y-1`}>
                      {/* Name & Function Tag */}
                      {!isMe && (
                        <div className="flex items-center gap-1.5 px-1">
                          <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold tracking-wide uppercase">
                            {msg.senderFunction}
                          </span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div className={`p-4 rounded-[24px] text-sm leading-relaxed shadow-sm transition-all border ${
                        isMe 
                          ? 'bg-blue-600 border-blue-500 text-white rounded-br-none rounded-2xl' 
                          : 'bg-white border-slate-100 text-slate-700 rounded-bl-none rounded-2xl'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        
                        {/* Message meta */}
                        <div className={`flex items-center justify-end gap-1 mt-1.5 text-[9px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                          <span>{formatTime(msg.timestamp)}</span>
                          {isMe && <CheckCheck size={12} className="text-blue-200" />}
                        </div>
                      </div>
                    </div>

                    {/* Avatar (Right side, only if me) */}
                    {isMe && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0 mb-1">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Info panel (Right Sidebar) */}
        {showInfoPanel && (
          <div className="w-64 border-l border-slate-200 bg-white p-6 overflow-y-auto no-scrollbar hidden lg:flex flex-col gap-6 shrink-0 animate-in slide-in-from-right duration-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles size={16} className="text-blue-500" />
                Dicas do Ministério
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Este chat serve para conectar o ministério em tempo real. Alinhe tons, tire dúvidas de compasso ou compartilhe as cifras!
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quem está online</h4>
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
                        {u.name.charAt(0)}
                      </span>
                      <div className="max-w-[120px] truncate">
                        <p className="text-xs font-semibold text-slate-700 truncate">{u.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{u.function}</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-200" title="Online" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-auto">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                Histórico persistente localmente
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Footer Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
        {currentUser?.role === UserRole.MEMBER && settings?.allowMemberChat === false ? (
          <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl p-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
            <Info size={16} className="text-amber-500 shrink-0" />
            <span>O envio de mensagens para membros foi temporariamente desativado pelo líder.</span>
          </div>
        ) : (
          <>
            {/* Quick Replies chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-1 no-scrollbar scroll-smooth">
              {QUICK_REPLIES.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600 transition-colors whitespace-nowrap font-medium"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input box */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Enviar mensagem como ${currentUser?.name || 'membro'}...`}
                  className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all text-slate-700 shadow-inner"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Inserir emoji"
                  onClick={() => setMessageText(prev => prev + ' 🙏')}
                >
                  <Smile size={18} />
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!messageText.trim()}
                className={`p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                  messageText.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 scale-100 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                }`}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </footer>
    </div>
  );
};

export default Chat;
