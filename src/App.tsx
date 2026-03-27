import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  User, 
  Stethoscope, 
  Building2, 
  ChevronRight, 
  AlertTriangle, 
  Camera, 
  Send, 
  Plus,
  ArrowLeft,
  LayoutDashboard,
  MessageSquare,
  Info
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, Language, UserRole, Message, AppState } from './types';
import { generateVetResponse } from './services/geminiService';

export default function App() {
  const [state, setState] = useState<AppState>({
    language: null,
    role: null,
    messages: [],
    isEmergency: false,
  });

  const [view, setView] = useState<'language' | 'role' | 'dashboard' | 'chat'>('language');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const handleLanguageSelect = (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
    setView('role');
  };

  const handleRoleSelect = (role: UserRole) => {
    setState(prev => ({ ...prev, role }));
    setView('dashboard');
  };

  const handleSendMessage = async (text: string = inputText, image: string | null = selectedImage) => {
    if (!text.trim() && !image) return;
    if (!state.role || !state.language) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      image: image || undefined
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setInputText('');
    setSelectedImage(null);
    setIsTyping(true);
    setView('chat');

    try {
      const response = await generateVetResponse(state.role, state.language, text, image || undefined);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      const isEmergency = response.includes('⚠️ EMERGENCY') || response.includes('EMERGENCY');

      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, assistantMsg],
        isEmergency: prev.isEmergency || isEmergency
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const ownerOptions = [
    { id: 'forecast', label: 'Disease Forecast', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'diagnosis', label: 'AI Diagnosis', icon: Stethoscope, color: 'text-emerald-500' },
    { id: 'connect', label: 'Connect to Vet', icon: User, color: 'text-blue-500' },
    { id: 'treatment', label: 'Treatment Guide', icon: Info, color: 'text-purple-500' },
    { id: 'farm', label: 'Farm Dashboard', icon: LayoutDashboard, color: 'text-indigo-500' },
    { id: 'schemes', label: 'Govt Schemes', icon: Building2, color: 'text-orange-500' },
  ];

  const vetOptions = [
    { id: 'clinical', label: 'Clinical Support', icon: Stethoscope, color: 'text-emerald-500' },
    { id: 'dosage', label: 'Dosage Calculator', icon: Info, color: 'text-blue-500' },
    { id: 'amr', label: 'AMR Predictor', icon: AlertTriangle, color: 'text-red-500' },
    { id: 'radiology', label: 'Radiology AI', icon: Camera, color: 'text-indigo-500' },
    { id: 'sop', label: 'SOP Library', icon: Building2, color: 'text-slate-500' },
  ];

  const institutionOptions = [
    { id: 'admin', label: 'Administration', icon: Building2, color: 'text-slate-500' },
    { id: 'inventory', label: 'Drug Inventory', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'trends', label: 'Disease Trends', icon: AlertTriangle, color: 'text-orange-500' },
  ];

  const getDashboardOptions = () => {
    if (state.role === 'owner') return ownerOptions;
    if (state.role === 'vet') return vetOptions;
    if (state.role === 'institution') return institutionOptions;
    return [];
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== 'language' && (
            <button 
              onClick={() => view === 'chat' ? setView('dashboard') : view === 'dashboard' ? setView('role') : setView('language')}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <h1 className="font-bold text-xl tracking-tight">VetAI</h1>
          </div>
        </div>
        {state.language && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            <Languages size={14} />
            {state.language.nativeName}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'language' && (
            <motion.div 
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 py-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Select Language</h2>
                <p className="text-slate-500">Choose your preferred language to continue</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang)}
                    className="glass-card p-4 text-center hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95"
                  >
                    <div className="text-lg font-bold">{lang.nativeName}</div>
                    <div className="text-xs text-slate-400">{lang.name}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'role' && (
            <motion.div 
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 py-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Welcome to VetAI 🐄</h2>
                <p className="text-slate-500">Please select your role</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => handleRoleSelect('owner')} className="w-full glass-card p-5 flex items-center justify-between hover:border-emerald-500 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">Owner / Farmer</div>
                      <div className="text-sm text-slate-500">Pashu Malik</div>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-emerald-500" />
                </button>
                <button onClick={() => handleRoleSelect('vet')} className="w-full glass-card p-5 flex items-center justify-between hover:border-emerald-500 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Stethoscope size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">Veterinarian / Doctor</div>
                      <div className="text-sm text-slate-500">Pashu Chikitsak</div>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
                </button>
                <button onClick={() => handleRoleSelect('institution')} className="w-full glass-card p-5 flex items-center justify-between hover:border-emerald-500 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">Institution / Management</div>
                      <div className="text-sm text-slate-500">Sansthan / Prabandhan</div>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-slate-800" />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
                <button onClick={() => setView('chat')} className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                  <MessageSquare size={16} />
                  Open Chat
                </button>
              </div>

              {state.isEmergency && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
                  <AlertTriangle className="text-red-600 shrink-0" />
                  <div>
                    <div className="font-bold text-red-900">Emergency Alert</div>
                    <div className="text-sm text-red-700">A critical condition was detected. Please contact a vet immediately.</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {getDashboardOptions().map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSendMessage(`Help me with ${opt.label}`)}
                    className="glass-card p-4 flex flex-col items-center gap-3 text-center hover:bg-white hover:shadow-md transition-all active:scale-95"
                  >
                    <div className={`p-3 rounded-xl bg-slate-50 ${opt.color}`}>
                      <opt.icon size={24} />
                    </div>
                    <div className="font-semibold text-sm leading-tight">{opt.label}</div>
                  </button>
                ))}
              </div>

              <div className="bg-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <h3 className="font-bold text-lg">AI Diagnosis</h3>
                  <p className="text-emerald-100 text-sm">Upload a photo of your animal for an instant health check.</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                  >
                    <Camera size={16} />
                    Start Scan
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                  <Stethoscope size={120} />
                </div>
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-full -mx-4 -mb-4"
            >
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {state.messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                      <MessageSquare size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500">Start a conversation with VetAI. You can ask about disease symptoms, treatments, or farm management.</p>
                  </div>
                )}
                {state.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.image && (
                        <img src={msg.image} alt="Uploaded" className="rounded-lg mb-2 max-h-48 w-full object-cover" />
                      )}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content}
                      </div>
                      <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-slate-200 p-4 space-y-3">
                {selectedImage && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 text-xs text-slate-500 truncate">Image ready to analyze</div>
                    <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-slate-200 rounded-full">
                      <Plus className="rotate-45 text-slate-400" size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() && !selectedImage}
                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Footer Nav (Only on Dashboard/Chat) */}
      {(view === 'dashboard' || view === 'chat') && (
        <nav className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around z-20">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </button>
          <button 
            onClick={() => setView('chat')}
            className={`flex flex-col items-center gap-1 ${view === 'chat' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <MessageSquare size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
          </button>
          <button 
            onClick={() => handleSendMessage("Show me general management suggestions")}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <Info size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Help</span>
          </button>
        </nav>
      )}
    </div>
  );
}
