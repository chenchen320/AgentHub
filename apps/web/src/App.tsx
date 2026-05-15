import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  MessageSquare, Code, Layout, Settings, Search, Send, User, Bot, Layers, 
  Terminal, Zap, Github as GithubIcon, ChevronRight, PanelLeftClose, PlusCircle
} from 'lucide-react';
import type { ChatMessage } from '@agenthub/shared';
import { AgentType } from '@agenthub/shared';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3001');

const MainLayout = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      conversationId: 'default', 
      role: 'assistant', 
      content: '你好！我是 AgentHub 协调器。我可以帮你拆解复杂需求，并协调其他 Agent 共同完成你的项目。今天我们打算构建什么？', 
      agentType: AgentType.ORCHESTRATOR,
      createdAt: new Date().toISOString() 
    }
  ]);
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
    <div className="flex h-screen w-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* 左侧侧边栏 */}
      <aside className="w-72 border-r border-slate-800/60 flex flex-col bg-slate-900/40 backdrop-blur-xl">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AgentHub</h1>
              <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-tighter">开发版 v1.0.0</p>
            </div>
          </div>
          <PanelLeftClose size={18} className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" />
        </div>

        <div className="px-4 mb-4">
          <button className="w-full py-2.5 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg flex items-center gap-2 text-sm font-medium transition-all group">
            <PlusCircle size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            开启新项目
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-6">
          <section>
            <h2 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MessageSquare size={12} /> 活跃会话
            </h2>
            <div className="space-y-1">
              {['初始化 AgentHub', '重构 UI 设计', '数据库 Schema 定义'].map((item, i) => (
                <div key={i} className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${i === 0 ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'hover:bg-slate-800/40 text-slate-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`} />
                  <span className="text-sm truncate font-medium">{item}</span>
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Bot size={12} /> 团队成员
            </h2>
            <div className="space-y-1 px-1">
              {[
                { name: '协调器 (Orchestrator)', role: '系统大脑', icon: Bot, color: 'text-indigo-400' },
                { name: '程序员 (Coder)', role: '代码实现', icon: Code, color: 'text-emerald-400' },
                { name: '审查者 (Reviewer)', role: '安全与质检', icon: Search, color: 'text-amber-400' }
              ].map((agent, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800/30 transition-colors group cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 ${agent.color}`}>
                    <agent.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">{agent.name}</p>
                    <p className="text-[10px] text-slate-500">{agent.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 bg-slate-900/60 border-t border-slate-800/60 mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-slate-400" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-200">主开发人员</p>
              <p className="text-[10px] text-slate-500 font-medium">在线</p>
            </div>
            <Settings size={18} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
          </div>
        </div>
      </aside>

      {/* 中间：主聊天区域 */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-sm font-bold tracking-tight text-slate-200">主项目会话</h2>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">私密</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 mr-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                  <Bot size={12} className="text-slate-500" />
                </div>
              ))}
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <GithubIcon size={18} />
            </button>
            <div className="h-4 w-[1px] bg-slate-800 mx-1" />
            <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              部署应用
            </button>
          </div>
        </header>

        {/* 消息列表 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-slate-800 border border-slate-700 text-slate-300' 
                  : 'bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 text-indigo-400'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-900/50 border border-slate-800/80 text-slate-300 rounded-tl-none backdrop-blur-sm'
                }`}>
                  {msg.content === '' && isTyping && i === messages.length - 1 ? (
                    <div className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
                <span className="mt-2 text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                  {msg.role === 'user' ? '开发者' : msg.agentType?.toUpperCase() || 'AGENT'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 输入区域 */}
        <div className="p-8 pt-4">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
            <div className="relative bg-[#0f172a] border border-slate-800 rounded-2xl p-2 pr-4 flex items-end gap-2 shadow-2xl transition-all focus-within:border-indigo-500/50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="给 AgentHub 发送消息... (使用 @ 提及 Agent)"
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-4 min-h-[52px] max-h-48 resize-none text-slate-200 placeholder-slate-600"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`mb-2 p-2 rounded-xl transition-all flex items-center justify-center ${
                  !input.trim() || isTyping 
                    ? 'text-slate-700 bg-slate-800/50 cursor-not-allowed' 
                    : 'text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Terminal size={10} /> 本地 Node v20.x</span>
            <span className="flex items-center gap-1.5"><Code size={10} /> Typescript 5.x</span>
            <span className="flex items-center gap-1.5"><Layers size={10} /> Prisma 数据库已连接</span>
          </div>
        </div>
      </main>

      {/* 右侧：动态工作区 */}
      <aside className="w-[450px] border-l border-slate-800/60 flex flex-col bg-slate-900/40 backdrop-blur-xl">
        <nav className="h-16 border-b border-slate-800/60 flex items-center px-6 gap-8">
          <button className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-400">
            预览 (Preview)
            <div className="absolute -bottom-[23px] left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          </button>
          <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
            对比 (Diff)
          </button>
          <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors ml-auto">
            历史记录
          </button>
        </nav>
        
        <div className="flex-1 bg-[#020617] m-4 rounded-xl border border-slate-800/80 shadow-inner overflow-hidden flex flex-col">
          <div className="h-8 bg-slate-900/80 border-b border-slate-800/80 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>
            <div className="mx-auto text-[10px] text-slate-500 font-mono tracking-tighter">localhost:5173/preview</div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-2xl group transition-transform hover:rotate-3">
              <Code size={32} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-400 mb-2">工作区就绪</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed max-w-[200px]">
              AI 生成的预览效果和代码对比将显示在这里。
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
