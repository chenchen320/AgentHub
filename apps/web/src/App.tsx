import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageSquare, Code, Layout, Settings, Search, Send, User, Bot, Layers } from 'lucide-react';

const MainLayout = () => {
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hello! I am AgentHub. How can I help you build today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages([...messages, userMsg]);
    setInput('');
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: `I've received your request: "${input}". I'll begin processing it shortly.`, 
        timestamp: new Date() 
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Left Sidebar: Sessions & Agents */}
      <aside className="w-64 border-r border-slate-700 flex flex-col bg-slate-800">
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold">AH</div>
          <h1 className="text-xl font-bold">AgentHub</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">History</h2>
            <div className="space-y-1">
              <button className="w-full text-left p-2 rounded bg-slate-700 text-sm">Initialize Project</button>
              <button className="w-full text-left p-2 rounded hover:bg-slate-700/50 text-sm text-slate-400">Setup Database</button>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Agents</h2>
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 text-sm text-indigo-400 font-medium">
                <Bot size={16} /> Orchestrator
              </div>
              <div className="flex items-center gap-2 p-2 text-sm text-slate-400">
                <Code size={16} /> Coder
              </div>
              <div className="flex items-center gap-2 p-2 text-sm text-slate-400">
                <Search size={16} /> Reviewer
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
            <User size={18} />
          </div>
          <span className="text-sm font-medium">Developer</span>
          <Settings size={18} className="ml-auto text-slate-400 cursor-pointer hover:text-slate-200" />
        </div>
      </aside>

      {/* Center: IM Chat Window */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-400" />
            <h2 className="font-semibold">Main Project Chat</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm text-slate-400 hover:text-slate-200">Share</button>
            <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition">Deploy</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'agent' && (
                <div className="w-8 h-8 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 border border-slate-700 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className="mt-2 text-[10px] opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-700">
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask @Orchestrator to build something..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition resize-none h-14"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-widest">
            Powered by AgentHub Core v1.0.0
          </p>
        </div>
      </main>

      {/* Right Sidebar: Dynamic Workspace */}
      <aside className="w-[450px] border-l border-slate-700 flex flex-col bg-slate-800">
        <nav className="h-16 border-b border-slate-700 flex items-center px-4 gap-4">
          <button className="flex items-center gap-2 text-sm font-medium border-b-2 border-indigo-500 h-full px-2 text-indigo-400">
            <Layout size={16} /> Preview
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 h-full px-2">
            <Code size={16} /> Diff
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 h-full px-2 ml-auto">
            <Layers size={16} /> Tasks
          </button>
        </nav>
        <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center text-slate-600 italic text-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Code size={24} />
            </div>
            <p>Ready to render code preview...</p>
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
