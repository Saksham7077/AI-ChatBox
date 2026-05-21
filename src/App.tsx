import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, Trash2, LogOut, Mail, Lock } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/20 rounded-full blur-[100px] mix-blend-multiply opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 translate-x-[-10%] translate-y-[-30%] w-[400px] h-[400px] bg-fuchsia-400/20 rounded-full blur-[100px] mix-blend-multiply opacity-50"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-zinc-200/60 rounded-3xl shadow-2xl p-8 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-zinc-500 text-sm">
            {isLogin ? "Enter your details to access the AI Assistant." : "Sign up to start chatting with the AI."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-md shadow-violet-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 hover:text-violet-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
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

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

function AiChat({ session }: { session: Session }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
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
      
      setMessages([...newMessages, { role: "assistant", content: botReply }]);
    } catch (error) {
      toast.error((error as Error).message || "Failed to communicate with AI");
      setMessages([...newMessages, { role: "assistant", content: "**Error:** Failed to reach the AI server." }]);
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

  const clearChat = () => setMessages([]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 relative overflow-hidden font-sans">
      <div className="flex items-center justify-between p-4 md:p-6 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
              AI Assistant
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 font-medium hidden sm:block">Powered by OpenRouter</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {messages.length > 0 && (
            <button 
              onClick={clearChat} 
              className="flex items-center text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Clear Chat</span>
            </button>
          )}
          
          <div className="h-6 w-[1px] bg-zinc-200 hidden md:block"></div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100"
          >
            <LogOut className="w-4 h-4 mr-0 md:mr-2" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="space-y-6 max-w-3xl mx-auto w-full pb-4">
            {messages.length === 0 ? (
              <div className="h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-100 to-fuchsia-100 flex items-center justify-center mb-6 ring-1 ring-violet-500/20 shadow-xl shadow-violet-500/10">
                  <Bot className="w-10 h-10 text-violet-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-zinc-800">Hi, {session.user.email?.split('@')[0]}!</h3>
                <p className="text-zinc-500 max-w-md text-base leading-relaxed">Ask me anything, from code help to writing emails, and I'll do my best to assist you.</p>
              </div>
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
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-md ${
                      message.role === "user" 
                        ? "bg-zinc-900 text-white" 
                        : "bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white"
                    }`}>
                      {message.role === "user" ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    
                    <div className={`flex flex-col gap-1.5 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                      <span className="text-xs font-medium text-zinc-500 px-1">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </span>
                      <div className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm border ${
                        message.role === "user" 
                          ? "bg-zinc-900 text-white border-zinc-900 rounded-tr-sm" 
                          : "bg-white border-zinc-200 rounded-tl-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-100 prose-pre:text-zinc-800 prose-pre:border prose-pre:border-zinc-200"
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
                <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="px-6 py-4 rounded-3xl rounded-tl-sm bg-white border border-zinc-200 shadow-sm flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                  <span className="text-sm font-medium text-zinc-600 animate-pulse">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-10 shrink-0">
          <div className="relative flex items-end max-w-3xl mx-auto gap-3 p-2 bg-white border border-zinc-200 rounded-3xl shadow-lg focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:border-violet-300 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 max-h-[150px] min-h-[44px] bg-transparent resize-none outline-none py-3 px-4 text-base text-zinc-900 placeholder:text-zinc-400"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="mb-1 mr-1 h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-violet-600 hover:bg-violet-700 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[11px] text-zinc-400 font-medium tracking-wide">AI can make mistakes. Consider verifying important information.</span>
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      {!session ? (
        <Auth onSession={setSession} />
      ) : (
        <AiChat session={session} />
      )}
    </>
  );
}
