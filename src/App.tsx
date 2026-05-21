import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, Trash2, LogOut, Mail, Lock, Menu, Plus, MessageSquare, X, Paperclip, FileText, FolderOpen, XCircle, FileImage, UploadCloud, Mic } from "lucide-react";
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
// Voice Studio Component
// -----------------------------------------------------------------------------
function VoiceStudio() {
    const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
    const [voiceName, setVoiceName] = useState("");
    const [voiceSample, setVoiceSample] = useState<File | null>(null);
    const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
    const [ttsText, setTtsText] = useState("");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isCloning, setIsCloning] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCloneVoice = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!voiceSample) return;
      if (!ELEVENLABS_API_KEY) {
        toast.error("ElevenLabs API key is missing from environment variables.");
        return;
      }
      setIsCloning(true);
      
      try {
        const formData = new FormData();
        formData.append("name", voiceName || "Custom Voice");
        formData.append("files", voiceSample);
        
        const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
          method: "POST",
          headers: { "xi-api-key": ELEVENLABS_API_KEY },
          body: formData
        });
        
        if (!response.ok) {
           const err = await response.json();
           throw new Error(err.detail?.message || err.detail || "Failed to clone voice");
        }
        
        const data = await response.json();
        setClonedVoiceId(data.voice_id);
        toast.success("Voice successfully cloned!");
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsCloning(false);
      }
    };
  
    const handleGenerateSpeech = async () => {
      if (!clonedVoiceId || !ttsText) return;
      setIsGenerating(true);
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${clonedVoiceId}`, {
          method: "POST",
          headers: {
               "xi-api-key": ELEVENLABS_API_KEY,
               "Content-Type": "application/json"
          },
          body: JSON.stringify({
              text: ttsText,
              model_id: "eleven_multilingual_v2"
          })
        });
        
        if (!response.ok) {
           const err = await response.json();
           throw new Error(err.detail?.message || err.detail || "Failed to generate speech");
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        toast.success("Audio generated successfully!");
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsGenerating(false);
      }
    };
  
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 w-full">
           <div className="max-w-3xl mx-auto space-y-8 pb-12">
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold text-white mb-3">AI Voice Studio</h2>
                 <p className="text-zinc-400">Clone any voice and generate hyper-realistic speech.</p>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none group-hover:from-violet-600/10 transition-colors" />
                 <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/20">
                      <Mic className="w-5 h-5" />
                    </div>
                    Step 1: Clone a Voice
                 </h2>
                 
                 {clonedVoiceId ? (
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 flex items-center justify-between relative z-10 shadow-lg">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">✓</div>
                         <div>
                           <p className="font-semibold text-emerald-300">Voice Successfully Cloned</p>
                           <p className="text-xs opacity-80 font-mono mt-0.5">ID: {clonedVoiceId}</p>
                         </div>
                       </div>
                       <button onClick={() => {setClonedVoiceId(null); setVoiceSample(null);}} className="text-sm font-medium hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">Reset</button>
                    </div>
                 ) : (
                    <form onSubmit={handleCloneVoice} className="space-y-5 relative z-10">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider ml-1 mb-2">Voice Name</label>
                        <input type="text" required value={voiceName} onChange={e=>setVoiceName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="e.g. John's Voice" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider ml-1 mb-2">Audio Sample (MP3/WAV, ~1 min clear speaking)</label>
                        <div className="w-full bg-black/40 border border-white/10 border-dashed rounded-xl px-4 py-6 text-center hover:bg-black/60 transition-colors relative">
                          <input type="file" required accept="audio/*" onChange={e=>setVoiceSample(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <UploadCloud className="w-8 h-8 text-violet-400" />
                            {voiceSample ? (
                               <p className="text-sm text-emerald-400 font-medium">{voiceSample.name}</p>
                            ) : (
                               <p className="text-sm text-zinc-400">Click or drag audio file here to upload</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button type="submit" disabled={isCloning || !voiceSample} className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20">
                         {isCloning ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload & Clone Voice"}
                      </button>
                    </form>
                 )}
              </div>

              <div className={`bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 ${!clonedVoiceId ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                 <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-transparent pointer-events-none" />
                 <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    Step 2: Generate Speech
                 </h2>
                 <div className="space-y-5 relative z-10">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider ml-1 mb-2">Text to Speech</label>
                      <textarea
                        value={ttsText}
                        onChange={e=>setTtsText(e.target.value)}
                        placeholder="Type what you want the cloned voice to say..."
                        rows={5}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                      />
                    </div>
                    <button 
                       onClick={handleGenerateSpeech}
                       disabled={!clonedVoiceId || !ttsText || isGenerating}
                       className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/20"
                    >
                       {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Audio"}
                    </button>
                    
                    {audioUrl && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 bg-black/40 border border-cyan-500/30 rounded-2xl shadow-inner">
                          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">Generated Result</p>
                          <audio src={audioUrl} controls className="w-full h-12 rounded-lg outline-none" />
                       </motion.div>
                    )}
                 </div>
              </div>
           </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Chat Component
// -----------------------------------------------------------------------------
interface Attachment {
  name: string;
  type: string;
  data: string; // base64 for image, raw text for text files
  isImage: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
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
  
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(`ai_chats_${session.user.id}`, JSON.stringify(chatSessions));
    } catch (e) {
      // If we hit quota limits, we could notify the user here.
    }
  }, [chatSessions, session.user.id]);

  useEffect(() => {
    if (messagesEndRef.current && activeTab === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatSessions, activeChatId, isLoading, attachments, activeTab]);

  const activeChat = chatSessions.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  // --- File Upload Logic ---
  const allowedExtensions = ['.txt', '.md', '.json', '.csv', '.js', '.ts', '.py', '.html', '.css', '.tsx', '.jsx'];

  const isAllowedFile = (file: File) => {
    if (file.type.startsWith('image/')) return true;
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(ext);
  };

  const processFile = (file: File): Promise<Attachment | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            type: file.type,
            data: e.target?.result as string,
            isImage: true
          });
        };
        reader.readAsDataURL(file);
      } else if (file.size < 1024 * 500) { // Limit text files to 500kb
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            type: file.type || "text/plain",
            data: e.target?.result as string,
            isImage: false
          });
        };
        reader.readAsText(file);
      } else {
         toast.error(`File ${file.name} is too large or not supported.`);
         resolve(null);
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setIsAttachMenuOpen(false);
    
    const validFiles = files.filter(f => 
      !f.webkitRelativePath.includes('node_modules') && 
      !f.webkitRelativePath.includes('.git')
    );
    
    const processQueue = validFiles.filter(isAllowedFile).slice(0, 10);
    if (validFiles.length > 10) {
      toast.warning("Limited to 10 files per message to prevent overloading.");
    }
    if (processQueue.length === 0) {
      toast.error("No valid text or image files found in selection.");
      return;
    }

    const processed = await Promise.all(processQueue.map(processFile));
    const validProcessed = processed.filter(Boolean) as Attachment[];
    
    setAttachments(prev => [...prev, ...validProcessed]);
    e.target.value = ''; // reset input
  };
  // -----------------------

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMessage = input.trim();
    setInput("");
    const currentAttachments = [...attachments];
    setAttachments([]); // clear staging
    
    let chatId = activeChatId;
    let newSessions = [...chatSessions];
    
    if (!chatId) {
      chatId = Date.now().toString();
      const titleText = userMessage || (currentAttachments.length > 0 ? `Uploaded ${currentAttachments.length} file(s)` : "New Chat");
      const newChat: ChatSession = {
        id: chatId,
        title: titleText.slice(0, 30) + (titleText.length > 30 ? "..." : ""),
        messages: [],
        updatedAt: Date.now()
      };
      newSessions = [newChat, ...newSessions];
      setActiveChatId(chatId);
    }
    
    const currentChatIndex = newSessions.findIndex(c => c.id === chatId);
    const newMessageObj: Message = { 
      role: "user", 
      content: userMessage,
      attachments: currentAttachments 
    };
    const newMessages = [...newSessions[currentChatIndex].messages, newMessageObj];
    
    newSessions[currentChatIndex] = {
      ...newSessions[currentChatIndex],
      messages: newMessages,
      updatedAt: Date.now()
    };
    
    const activeSession = newSessions.splice(currentChatIndex, 1)[0];
    newSessions = [activeSession, ...newSessions];
    
    setChatSessions(newSessions);
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(m => {
        if (m.role === "user" && m.attachments && m.attachments.length > 0) {
          const content = [];
          let textContent = m.content || "Here are some files:";
          
          const textAttachments = m.attachments.filter(a => !a.isImage);
          if (textAttachments.length > 0) {
             textContent += "\n\nAttached Files:\n" + textAttachments.map(a => `--- ${a.name} ---\n${a.data}\n--- End of ${a.name} ---`).join("\n\n");
          }
          
          content.push({ type: "text", text: textContent });
          
          m.attachments.filter(a => a.isImage).forEach(img => {
             content.push({ type: "image_url", image_url: { url: img.data } });
          });
          
          return { role: m.role, content };
        }
        return { role: m.role, content: m.content };
      });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Localhost AI Chat",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: apiMessages,
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
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        multiple 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*,.txt,.md,.js,.ts,.json,.csv,.py,.html,.css,.jsx,.tsx"
      />
      <input 
        type="file" 
        // @ts-ignore
        webkitdirectory="true" 
        directory="true"
        className="hidden" 
        ref={folderInputRef} 
        onChange={handleFileSelect} 
      />

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
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-zinc-200">Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-3 border-b border-white/5 shrink-0">
           <button onClick={() => setActiveTab("chat")} className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'chat' ? 'bg-violet-600/20 text-violet-300 shadow-sm border border-violet-500/30' : 'text-zinc-400 hover:bg-white/5 border border-transparent'}`}>
             <MessageSquare className="w-4 h-4" /> Chats
           </button>
           <button onClick={() => setActiveTab("voice")} className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'voice' ? 'bg-cyan-600/20 text-cyan-300 shadow-sm border border-cyan-500/30' : 'text-zinc-400 hover:bg-white/5 border border-transparent'}`}>
             <Mic className="w-4 h-4" /> Voice Studio
           </button>
        </div>
        
        {activeTab === "chat" && (
          <>
            <div className="p-3 shrink-0">
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
          </>
        )}

        {activeTab === "voice" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 text-sm gap-4">
             <Mic className="w-8 h-8 text-zinc-600 opacity-50" />
             <p>Upload a voice sample in the Studio to create a hyper-realistic AI clone.</p>
          </div>
        )}
        
        <div className="p-4 border-t border-white/5 shrink-0">
           <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
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
            <div className={`p-2.5 rounded-xl text-white hidden sm:flex shadow-lg ${activeTab === 'chat' ? 'bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-violet-500/30' : 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-500/30'}`}>
              {activeTab === 'chat' ? <Sparkles className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {activeTab === 'chat' ? 'AI Assistant' : 'Voice Studio'}
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 font-medium flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-sm ${activeTab === 'chat' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}></span>
                {activeTab === 'chat' ? 'Powered by gpt-4o-mini' : 'Powered by ElevenLabs'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeTab === 'chat' && activeChatId && (
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

        {/* Dynamic Content */}
        {activeTab === "voice" ? (
           <VoiceStudio />
        ) : (
           <div className="flex-1 flex flex-col overflow-hidden w-full relative z-10">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar" onClick={() => setIsAttachMenuOpen(false)}>
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
                        How can I help you today? Upload images, text files, or folders to ask questions about them.
                      </p>
                      
                      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                        {["Explain quantum computing", "Help me debug an error", "Summarize an attached document", "What's in this image?"].map((suggestion, i) => (
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
                            
                            {/* Render Attachments in History */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {message.attachments.map((att, i) => (
                                  att.isImage ? (
                                    <img key={i} src={att.data} alt={att.name} className="w-32 h-32 object-cover rounded-xl border border-white/10 shadow-md" />
                                  ) : (
                                    <div key={i} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-2.5 max-w-[200px] shadow-sm">
                                       <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                                       <span className="text-xs text-zinc-400 truncate font-medium">{att.name}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                            
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
              <div className="p-4 md:p-6 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent z-20 shrink-0 relative">
                <div className="max-w-4xl mx-auto flex flex-col gap-2">
                  
                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {attachments.map((att, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          key={i} 
                          className="relative flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md border border-white/10 rounded-xl p-2 pr-10 max-w-[200px] shadow-lg"
                        >
                          {att.isImage ? (
                             <img src={att.data} alt="preview" className="w-8 h-8 object-cover rounded-md border border-white/5" />
                          ) : (
                             <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                               <FileText className="w-4 h-4 text-violet-400" />
                             </div>
                          )}
                          <span className="text-xs text-zinc-300 truncate font-medium">{att.name}</span>
                          <button 
                             onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                             className="absolute right-2 text-zinc-500 hover:text-red-400 transition-colors p-1"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="relative flex items-end gap-2 p-2 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50 transition-all">
                    
                    {/* Attachment Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                        className="mb-1 ml-1 h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      
                      <AnimatePresence>
                        {isAttachMenuOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-4 flex flex-col bg-zinc-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px] z-50"
                          >
                            <button 
                              onClick={() => fileInputRef.current?.click()} 
                              className="px-4 py-3.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5"
                            >
                              <FileImage className="w-4 h-4 text-violet-400" /> Upload Files
                            </button>
                            <button 
                              onClick={() => folderInputRef.current?.click()} 
                              className="px-4 py-3.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                            >
                              <FolderOpen className="w-4 h-4 text-cyan-400" /> Upload Folder
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message AI Assistant... (or attach files)"
                      className="flex-1 max-h-[200px] min-h-[44px] bg-transparent resize-none outline-none py-3 px-2 text-base text-zinc-100 placeholder:text-zinc-500"
                      rows={1}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={(!input.trim() && attachments.length === 0) || isLoading}
                      className="mb-1 mr-1 h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Send className="w-5 h-5 ml-0.5 text-black" />}
                    </button>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <span className="text-[11px] text-zinc-500 font-medium tracking-wide">
                    AI can make mistakes. Verify important information. Audio/Video not supported natively yet.
                  </span>
                </div>
              </div>
           </div>
        )}
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
