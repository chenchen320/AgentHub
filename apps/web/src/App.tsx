import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  MessageSquare, Code, Layout, Settings, Search, Send, User, Bot, Layers, 
  Terminal, Zap, Globe, ChevronRight, X, Plus, Terminal as TerminalIcon
} from 'lucide-react';
import type { ChatMessage } from '@agenthub/shared';
import { AgentType } from '@agenthub/shared';
import { io, Socket } from 'socket.io-client';
import { useLangStore } from './store/useLangStore';
import { translations } from './utils/i18n';

const socket: Socket = io('http://localhost:3001');

const MainLayout = () => {
  const { lang, setLang } = useLangStore();
  const t = translations[lang];

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      conversationId: 'default', 
      role: 'assistant', 
      content: t.ORCHESTRATOR_INIT, 
      agentType: AgentType.ORCHESTRATOR,
      createdAt: new Date().toISOString() 
    }
  ]);

  // 当语言切换且只有初始消息时，更新初始消息语言
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '1') {
      setMessages([{
        ...messages[0],
        content: t.ORCHESTRATOR_INIT
      }]);
    }
  }, [lang]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('aiChunk', (data: { chunk: string, conversationId: string }) => {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          return [
            ...newMessages.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + data.chunk }
          ];
        }
        return newMessages;
      });
    });

    socket.on('aiComplete', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('aiChunk');
      socket.off('aiComplete');
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { 
      id: Date.now().toString(),
      conversationId: 'default',
      role: 'user', 
      content: input, 
      createdAt: new Date().toISOString() 
    };

    const placeholderMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      conversationId: 'default',
      role: 'assistant',
      content: '',
      agentType: AgentType.ORCHESTRATOR,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg, placeholderMsg]);
    setInput('');
    setIsTyping(true);
    
    socket.emit('sendMessage', {
      messages: [...messages, userMsg],
      agentType: AgentType.ORCHESTRATOR
    });
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white font-sans selection:bg-brand selection:text-black overflow-hidden border-[8px] border-black">
      {/* LEFT SIDEBAR - INDUSTRIAL STYLE */}
      <aside className="w-80 border-2 border-white flex flex-col bg-black relative">
        <div className="p-6 border-b-2 border-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand border-2 border-white flex items-center justify-center shadow-brutal-sm">
              <Zap size={24} className="text-black fill-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none italic uppercase">{t.APP_TITLE}</h1>
              <div className="mt-1 inline-block bg-white text-black text-[10px] font-bold px-1 uppercase">{t.VERSION}</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b-2 border-white">
          <button className="w-full h-12 bg-white text-black border-2 border-white hover:bg-brand hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 font-black uppercase tracking-tighter shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            <Plus size={20} strokeWidth={3} />
            {t.NEW_FORGE}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth">
          <section>
            <h2 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-brand" /> {t.ACTIVE_STREAMS}
            </h2>
            <div className="space-y-2">
              {[t.STREAM_1, t.STREAM_2, t.STREAM_3].map((item, i) => (
                <div key={i} className={`px-4 py-3 border-2 transition-all cursor-pointer font-mono text-xs ${i === 0 ? 'bg-brand text-black border-white font-bold' : 'bg-black text-white border-white/20 hover:border-white'}`}>
                  {i === 0 && <span className="mr-2">»</span>}
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black text-brand uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-brand" /> {t.THE_SWARM}
            </h2>
            <div className="space-y-3">
              {[
                { name: 'ORCHESTRATOR', role: t.ROLE_ORCHESTRATOR, icon: Bot, active: true },
                { name: 'CODER', role: t.ROLE_CODER, icon: Code, active: false },
                { name: 'REVIEWER', role: t.ROLE_REVIEWER, icon: Search, active: false }
              ].map((agent, i) => (
                <div key={i} className="group border-2 border-white/20 hover:border-white p-3 flex items-center gap-4 transition-all cursor-crosshair">
                  <div className={`w-10 h-10 border-2 border-white flex items-center justify-center ${agent.active ? 'bg-brand text-black shadow-brutal-sm' : 'bg-gray-soft text-white'}`}>
                    <agent.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black tracking-tight">{agent.name}</p>
                    <p className="text-[9px] font-mono text-white/50 uppercase">{agent.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t-2 border-white bg-gray-soft">
          <div className="flex items-center gap-4 p-2 border-2 border-transparent hover:border-white transition-all cursor-pointer">
            <div className="w-10 h-10 border-2 border-white bg-brand shadow-brutal-sm flex items-center justify-center">
              <User size={20} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase">{t.ROOT_USER}</p>
              <p className="text-[9px] font-mono text-brand">{t.STATUS_ONLINE}</p>
            </div>
            <Settings size={18} className="text-white/40 group-hover:text-white" />
          </div>
        </div>
      </aside>

      {/* MAIN CHAT - EDITORIAL STYLE */}
      <main className="flex-1 flex flex-col min-w-0 bg-black border-y-2 border-r-2 border-white">
        <header className="h-16 border-b-2 border-white flex items-center justify-between px-8 bg-black z-10">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-brand" />
            <h2 className="text-sm font-black uppercase tracking-[0.1em]">{t.SESSION_TITLE}</h2>
          </div>
          <div className="flex items-center gap-6">
            {/* 语言切换按钮 */}
            <button 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="px-4 py-1 border-2 border-white font-black text-[10px] uppercase hover:bg-brand hover:text-black transition-all active:translate-y-[1px]"
            >
              {lang === 'zh' ? 'ENGLISH' : '中文'}
            </button>

            <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-white/40">
              <span>LATENCY: 24MS</span>
              <span className="w-1 h-1 bg-white/40 rounded-full" />
              <span>NODES: 03</span>
            </div>
            <button className="px-6 py-1.5 bg-brand text-black font-black uppercase text-xs border-2 border-white shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
              {t.DEPLOY_SWARM}
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-12 scroll-smooth font-mono">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-[10px] font-black uppercase px-2 py-0.5 ${msg.role === 'user' ? 'bg-white text-black' : 'bg-brand text-black'}`}>
                  {msg.role === 'user' ? t.USER_AUTH : (msg.agentType || t.SYSTEM_LABEL)}
                </div>
                <div className="text-[9px] text-white/40">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
              
              <div className={`max-w-[85%] border-2 p-6 transition-all ${
                msg.role === 'user' 
                  ? 'bg-black text-white border-white shadow-brutal-white' 
                  : 'bg-white text-black border-brand shadow-brutal'
              }`}>
                {msg.content === '' && isTyping && i === messages.length - 1 ? (
                  <div className="flex gap-2 py-1">
                    <div className="w-2 h-2 bg-black animate-pulse" />
                    <div className="w-2 h-2 bg-black animate-pulse [animation-delay:200ms]" />
                    <div className="w-2 h-2 bg-black animate-pulse [animation-delay:400ms]" />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed tracking-tight">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="p-8 pt-0">
          <div className="border-4 border-white bg-black p-1 shadow-brutal">
            <div className="flex items-end gap-2 bg-gray-soft p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={t.INPUT_PLACEHOLDER}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-mono p-4 min-h-[60px] max-h-48 resize-none text-white placeholder-white/20"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-14 h-14 border-2 flex items-center justify-center transition-all ${
                  !input.trim() || isTyping 
                    ? 'border-white/10 text-white/10 cursor-not-allowed' 
                    : 'border-white bg-brand text-black hover:scale-105 active:scale-95'
                }`}
              >
                <Send size={24} strokeWidth={3} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 opacity-30 font-mono text-[9px] uppercase tracking-widest">
            <span className="flex items-center gap-2"><TerminalIcon size={12} /> {t.STACK_INFO}</span>
            <span className="flex items-center gap-2"><Code size={12} /> {t.TYPE_INFO}</span>
            <span className="flex items-center gap-2"><Layers size={12} /> {t.DATA_INFO}</span>
          </div>
        </div>
      </main>

      {/* RIGHT WORKSPACE - CYBER PREVIEW */}
      <aside className="w-[450px] flex flex-col bg-black border-y-2 border-r-2 border-white">
        <nav className="h-16 border-b-2 border-white flex items-stretch divide-x-2 divide-white">
          <button className="flex-1 bg-brand text-black font-black text-xs uppercase flex items-center justify-center gap-2 tracking-widest">
            <Layout size={14} strokeWidth={3} /> {t.PREVIEW}
          </button>
          <button className="flex-1 hover:bg-white hover:text-black transition-all text-white font-black text-xs uppercase flex items-center justify-center gap-2 tracking-widest">
            <Code size={14} strokeWidth={3} /> {t.DIFF}
          </button>
          <button className="w-16 hover:bg-brand hover:text-black transition-all flex items-center justify-center">
            <X size={20} />
          </button>
        </nav>
        
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 border-2 border-white relative group overflow-hidden bg-gray-soft flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute top-0 left-0 right-0 h-8 border-b-2 border-white flex items-center px-4 justify-between bg-black">
              <div className="flex gap-2">
                <div className="w-2 h-2 border border-white" />
                <div className="w-2 h-2 border border-white" />
                <div className="w-2 h-2 border border-white" />
              </div>
              <div className="text-[9px] font-mono uppercase text-white/40">{t.WORKSPACE_TITLE}</div>
            </div>
            
            <div className="w-24 h-24 border-4 border-white flex items-center justify-center bg-black group-hover:rotate-12 transition-transform duration-500">
              <Terminal size={40} className="text-brand" />
            </div>
            <h3 className="text-lg font-black uppercase mt-8 italic">{t.AWAITING_PAYLOAD}</h3>
            <p className="text-[10px] font-mono text-white/40 leading-relaxed max-w-[240px] mt-2">
              {t.WORKSPACE_MSG}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </Router>
  );
};

export default App;
