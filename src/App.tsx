import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, Trash2, LogOut, Mail, Lock, Menu, Plus, MessageSquare, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./utils/supabase";
import type { Session } from "@supabase/supabase-js";

// -----------------------------------------------------------------------------
// Authentication Component
// -----------------------------------------------------------------------------
function Auth({ onSession }: { onSession: (session: Session | null) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Successfully logged in!");
        onSession(data.session);
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Successfully signed up! You are now logged in.");
        onSession(data.session);
      }
    } catch (error) {
      toast.error((error as Error).message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-4 font-sans relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/2 translate-x-[-10%] translate-y-[-30%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-950/50 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-8 z-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-zinc-400 text-sm">
            {isLogin ? "Enter your details to access the AI Assistant." : "Sign up to start chatting with the AI."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 text-white placeholder:text-zinc-600 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 text-white placeholder:text-zinc-600 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-violet-400 font-medium hover:underline underline-offset-4">
              {isLogin ? "Sign up" : "Sign in"}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Chat Component
// -----------------------------------------------------------------------------
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

function AiChat({ session }: { session: Session }) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(`ai_chats_${session.user.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(
    chatSessions.length > 0 ? chatSessions[0].id : null
  );
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(`ai_chats_${session.user.id}`, JSON.stringify(chatSessions));
  }, [chatSessions, session.user.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatSessions, activeChatId, isLoading]);

  const activeChat = chatSessions.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    let chatId = activeChatId;
    let newSessions = [...chatSessions];
    
    // Create new chat session if there isn't an active one
    if (!chatId) {
      chatId = Date.now().toString();
      const newChat: ChatSession = {
        id: chatId,
        title: userMessage.slice(0, 30) + (userMessage.length > 30 ? "..." : ""),
        messages: [],
        updatedAt: Date.now()
      };
      newSessions = [newChat, ...newSessions];
      setActiveChatId(chatId);
    }
    
    const currentChatIndex = newSessions.findIndex(c => c.id === chatId);
    const newMessages = [...newSessions[currentChatIndex].messages, { role: "user", content: userMessage } as Message];
    
    newSessions[currentChatIndex] = {
      ...newSessions[currentChatIndex],
      messages: newMessages,
      updatedAt: Date.now()
    };
    
    // Bring active chat to top
    const activeSession = newSessions.splice(currentChatIndex, 1)[0];
    newSessions = [activeSession, ...newSessions];
    
    setChatSessions(newSessions);
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Localhost AI Chat",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "No response received.";
      
      setChatSessions(prev => {
        const idx = prev.findIndex(c => c.id === chatId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          messages: [...updated[idx].messages, { role: "assistant", content: botReply }],
          updatedAt: Date.now()
        };
        return updated;
      });
    } catch (error) {
      toast.error((error as Error).message || "Failed to communicate with AI");
      setChatSessions(prev => {
        const idx = prev.findIndex(c => c.id === chatId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          messages: [...updated[idx].messages, { role: "assistant", content: "**Error:** Failed to reach the AI server." }],
          updatedAt: Date.now()
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const deleteChat = () => {
    setChatSessions(prev => prev.filter(c => c.id !== activeChatId));
    setActiveChatId(null);
  };

  const createNewChat = () => {
    setActiveChatId(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] relative overflow-hidden font-sans text-zinc-100">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed md:relative z-50 h-full w-72 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-200">Chat History</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-3">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">No recent chats</div>
          ) : (
            chatSessions.map(chat => (
              <button
                key={chat.id}
                onClick={() => { setActiveChatId(chat.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeChatId === chat.id ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]" : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 border border-transparent"}`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <div className="flex-1 truncate text-sm font-medium">
                  {chat.title}
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-white/5">
           <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-900/10 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-8 bg-black/20 backdrop-blur-xl border-b border-white/5 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hidden sm:flex">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                AI Assistant
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Powered by OpenRouter
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeChatId && (
              <button 
                onClick={deleteChat} 
                className="flex items-center text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full relative z-10">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar">
            <div className="space-y-6 max-w-4xl mx-auto w-full pb-8">
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-[60vh] flex flex-col items-center justify-center text-center px-4"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-zinc-900 to-zinc-800 flex items-center justify-center mb-8 ring-1 ring-white/10 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-violet-500/20 rounded-3xl blur-xl group-hover:bg-violet-500/30 transition-all" />
                    <Bot className="w-12 h-12 text-zinc-300 relative z-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-white">Hi, {session.user.email?.split('@')[0]}!</h3>
                  <p className="text-zinc-400 max-w-md text-base leading-relaxed">
                    How can I help you today? I can write code, draft emails, answer questions, or just chat.
                  </p>
                  
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                    {["Write a React component", "Explain quantum computing", "Help me debug an error", "Draft a polite email"].map((suggestion, i) => (
                      <button 
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all text-sm text-zinc-300 text-left hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg ${
                        message.role === "user" 
                          ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white" 
                          : "bg-zinc-800 border border-white/10 text-white"
                      }`}>
                        {message.role === "user" ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-violet-400" />}
                      </div>
                      
                      <div className={`flex flex-col gap-1.5 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                        <span className="text-xs font-medium text-zinc-500 px-1">
                          {message.role === "user" ? "You" : "AI Assistant"}
                        </span>
                        <div className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm border ${
                          message.role === "user" 
                            ? "bg-violet-600/20 text-white border-violet-500/30 rounded-tr-sm" 
                            : "bg-white/[0.03] text-zinc-200 border-white/10 rounded-tl-sm prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10"
                        }`}>
                          {message.role === "assistant" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="px-6 py-4 rounded-3xl rounded-tl-sm bg-white/[0.03] border border-white/10 flex items-center gap-3">
                    <span className="flex gap-1.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent z-10 shrink-0 relative">
            <div className="relative flex items-end max-w-4xl mx-auto gap-3 p-2 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                className="flex-1 max-h-[200px] min-h-[44px] bg-transparent resize-none outline-none py-3 px-4 text-base text-zinc-100 placeholder:text-zinc-500"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="mb-1 mr-1 h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Send className="w-5 h-5 ml-0.5 text-black" />}
              </button>
            </div>
            <div className="text-center mt-4">
              <span className="text-[11px] text-zinc-500 font-medium tracking-wide">
                AI can make mistakes. Verify important information.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// App Entry
// -----------------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-cyan-500 animate-spin" style={{ animationDirection: "reverse" }} />
          </div>
          <span className="text-zinc-400 font-medium text-sm animate-pulse">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" theme="dark" />
      {!session ? (
        <Auth onSession={setSession} />
      ) : (
        <AiChat session={session} />
      )}
    </>
  );
}
