
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, ShieldAlert, Loader2, 
  Shield, AlertTriangle, 
  Phone, Search, Zap, Volume2, StopCircle, Mic, 
  Paperclip, Image as ImageIcon, FileText, FileAudio, Video, MicOff, Ban
} from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { Tab } from '../App';

interface ChatScreenProps {
  onNavigate: (tab: Tab) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isRisk?: boolean;
  groundingChunks?: any[];
  attachment?: {
      name: string;
      type: string;
      size: number;
  };
}

const OFFLINE_RESPONSES: Record<string, string> = {
  'công an': 'Công an KHÔNG BAO GIỜ làm việc qua điện thoại hay yêu cầu chuyển tiền. Nếu ai đó tự xưng là công an gọi đến, hãy cúp máy ngay và ra đồn công an gần nhất.',
  'chuyển tiền': 'CẢNH BÁO: Tuyệt đối không chuyển tiền cho người lạ hoặc người thân yêu cầu gấp qua tin nhắn/Facebook mà chưa gọi video xác thực.',
};

const ChatScreen: React.FC<ChatScreenProps> = ({ onNavigate }) => {
  const { user, isSeniorMode, speakUI, triggerHaptic } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'safe' | 'warning' | 'danger'>('safe');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false); 
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, riskLevel, attachedFile]); 

  // --- TTS ---
  const speakMessage = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingMsgId === id) {
          setSpeakingMsgId(null);
          return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = isSeniorMode ? 0.85 : 1.0; 
      utterance.onstart = () => setSpeakingMsgId(id);
      utterance.onend = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  };

  // --- INITIALIZE ---
  useEffect(() => {
    const initChat = async () => {
      try {
          const apiKey = process.env.API_KEY || "";
          const baseInstruction = `
            Bạn là TruthShield AI - Trợ lý An ninh mạng 24/7 chuyên về chống lừa đảo tại Việt Nam.
            Người dùng hiện tại: ${user?.name || 'Bạn'}, ${isSeniorMode ? 'là Người Cao Tuổi' : 'người dùng phổ thông'}.
            Ngắn gọn, súc tích, dễ hiểu.
            Nếu phát hiện các từ khóa nhạy cảm như "công an", "chuyển tiền", "mật khẩu", "otp", hãy bắt đầu câu trả lời bằng cụm từ "[CẢNH BÁO]" để kích hoạt chế độ bảo vệ cao nhất.
          `;

          if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            chatSessionRef.current = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: { systemInstruction: baseInstruction, tools: [{ googleMaps: {} }] },
            });
          }

          if (messages.length === 0) {
              const greeting = isSeniorMode 
                  ? `Chào bác ${user?.name || ''}! Cháu là Trợ lý An ninh.`
                  : `Xin chào ${user?.name || 'bạn'}! Tôi là TruthShield AI.`;
              setMessages([{ id: 'welcome', role: 'model', text: greeting }]);
          }
      } catch (error) { console.error(error); }
    };
    initChat();
    return () => {
        stopSpeaking();
        if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [user, isSeniorMode]);

  // --- INPUT HANDLERS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAttachedFile(e.target.files[0]);
  };

  const handleMicClick = () => {
    triggerHaptic('tap');
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    const Window = window as any;
    const SpeechRecognition = Window.SpeechRecognition || Window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        setInput((prev) => (prev ? prev + ' ' + event.results[0][0].transcript : event.results[0][0].transcript));
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
      recognitionRef.current = recognition;
    } else {
      setTimeout(() => { setInput(p => p + " Kiểm tra giúp tôi số này."); setIsListening(false); }, 1500);
    }
  };

  // --- SEND ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !attachedFile) || isLoading) return;

    const currentFile = attachedFile;
    const currentFileMeta = currentFile ? { name: currentFile.name, type: currentFile.type, size: currentFile.size } : undefined;

    setInput('');
    setAttachedFile(null);
    setIsLoading(true);
    stopSpeaking();

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend, attachment: currentFileMeta };
    setMessages(prev => [...prev, userMsg]);

    let responseText = "";
    let isRisk = false;

    try {
        if (chatSessionRef.current) {
            const prompt = currentFile ? `[File: ${currentFile.name}]. ${textToSend}` : textToSend;
            const result = await chatSessionRef.current.sendMessage({ message: prompt });
            responseText = result.text;
        } else { throw new Error("No API Key"); }
    } catch (error) {
        const foundKey = Object.keys(OFFLINE_RESPONSES).find(k => textToSend.toLowerCase().includes(k));
        responseText = foundKey ? OFFLINE_RESPONSES[foundKey] : "Tôi đang mất kết nối. Hãy thử lại sau.";
    } finally {
        // Keyword Detection for Risk Level
        if (responseText.includes("[CẢNH BÁO]")) { 
            setRiskLevel('danger'); 
            isRisk = true;
            triggerHaptic('error');
        } else if (responseText.toLowerCase().includes("cẩn thận") || responseText.toLowerCase().includes("cảnh giác")) { 
            setRiskLevel('warning');
        } else { 
            setRiskLevel('safe');
        }

        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText.replace("[CẢNH BÁO]", "").trim(),
            isRisk
        }]);
        setIsLoading(false);
    }
  };

  // --- DYNAMIC UI CONFIG ---
  const getUIConfig = () => {
    switch (riskLevel) {
      case 'danger':
        return {
          headerClasses: 'bg-red-100 border-red-300 shadow-md',
          iconContainer: 'bg-red-200 text-red-600 animate-pulse',
          icon: <ShieldAlert size={isSeniorMode ? 32 : 24} />,
          title: 'PHÁT HIỆN RỦI RO CAO',
          titleColor: 'text-red-900',
          statusText: '⚠️ CẢNH BÁO KHẨN CẤP',
          statusDot: 'bg-red-600 animate-ping',
          bgBody: 'bg-red-50/30'
        };
      case 'warning':
        return {
          headerClasses: 'bg-amber-50 border-amber-200 shadow-sm',
          iconContainer: 'bg-amber-100 text-amber-600',
          icon: <AlertTriangle size={isSeniorMode ? 32 : 24} />,
          title: 'Cần Cảnh Giác',
          titleColor: 'text-amber-900',
          statusText: '● Phát hiện nghi vấn',
          statusDot: 'bg-amber-500',
          bgBody: 'bg-amber-50/30'
        };
      default:
        return {
          headerClasses: 'bg-white border-slate-100 shadow-sm',
          iconContainer: 'bg-blue-100 text-blue-600',
          icon: <Bot size={isSeniorMode ? 32 : 24} />,
          title: 'Trợ Lý An Ninh AI',
          titleColor: 'text-slate-900',
          statusText: '● Trực tuyến',
          statusDot: 'bg-green-500',
          bgBody: 'bg-[#F8FAFC]'
        };
    }
  };

  const ui = getUIConfig();
  const messageTextClass = isSeniorMode ? 'text-xl leading-relaxed p-4' : 'text-sm leading-relaxed p-3';

  return (
    <div className={`flex flex-col h-full relative overflow-hidden transition-colors duration-500 ${ui.bgBody}`}>
        
        {/* HEADER */}
        <div className={`px-4 py-3 border-b flex items-center gap-3 z-20 shrink-0 transition-all duration-300 ${ui.headerClasses}`}>
            <div className={`rounded-full flex items-center justify-center flex-shrink-0 w-12 h-12 transition-colors ${ui.iconContainer}`}>
                {ui.icon}
            </div>
            <div className="flex-1 min-w-0">
                <h2 className={`font-black leading-none uppercase tracking-tight ${ui.titleColor} ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                    {ui.title}
                </h2>
                <div className={`font-bold opacity-90 mt-1 flex items-center gap-2 text-xs uppercase ${ui.titleColor}`}>
                    {riskLevel === 'danger' ? (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    ) : (
                        <span className={`w-2 h-2 rounded-full ${ui.statusDot}`}></span>
                    )}
                    {ui.statusText}
                </div>
            </div>
            {speakingMsgId && (
                <button onClick={stopSpeaking} className="p-2 bg-white/50 rounded-full text-slate-700 animate-pulse border border-slate-200">
                    <Volume2 size={24} />
                </button>
            )}
        </div>

        {/* DANGER ACTION CHIPS (Only Visible in Danger Mode) */}
        {riskLevel === 'danger' && (
            <div className="bg-red-100 px-4 py-3 flex gap-3 animate-in slide-in-from-top-4 z-10 shrink-0 border-b border-red-200 shadow-inner">
                <button 
                    onClick={() => setShowEmergencyModal(true)} 
                    className="flex-1 bg-red-600 text-white font-black py-3 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-sm active:scale-95"
                >
                    <Phone size={20} className="animate-pulse" fill="currentColor" /> GỌI 113
                </button>
                <button 
                    onClick={() => alert("Đã thêm vào danh sách chặn tạm thời!")} 
                    className="flex-1 bg-white text-red-600 border-2 border-red-200 font-bold py-3 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm active:scale-95"
                >
                    <Ban size={20} /> CHẶN SỐ
                </button>
            </div>
        )}

        {/* CHAT CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[95%] md:max-w-[85%]`}>
                        {msg.role === 'model' && (
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-1 shadow-sm ${msg.isRisk ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-blue-100 text-blue-600'}`}>
                                <Shield size={isSeniorMode ? 20 : 16} />
                            </div>
                        )}
                        <div className={`rounded-2xl shadow-sm whitespace-pre-wrap ${messageTextClass} ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : msg.isRisk 
                                    ? 'bg-red-50 border-2 border-red-200 text-red-900 rounded-bl-none shadow-red-100' 
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}>
                            {msg.attachment && <div className="text-xs italic mb-1 opacity-80 flex items-center gap-1"><Paperclip size={12}/> {msg.attachment.name}</div>}
                            {msg.text}
                        </div>
                        {msg.role === 'model' && (
                            <button onClick={() => speakMessage(msg.text, msg.id)} className="p-2 text-slate-400 hover:text-blue-600 touch-target opacity-50 hover:opacity-100 transition-opacity">
                                {speakingMsgId === msg.id ? <StopCircle size={24} /> : <Volume2 size={24} />}
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                     <div className={`bg-white/80 backdrop-blur text-slate-500 rounded-2xl rounded-tl-sm flex items-center gap-3 border border-slate-200 shadow-sm ${messageTextClass}`}>
                         <Loader2 size={20} className="animate-spin text-blue-600" />
                         <span className="font-bold">AI đang phân tích...</span>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="bg-white border-t border-slate-200 p-3 flex items-end gap-2 z-20 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
             <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-600 bg-slate-50 rounded-full h-12 w-12 flex items-center justify-center touch-target hover:bg-blue-50 transition-colors">
                 <Paperclip size={24} />
             </button>
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
             
             <div className="flex-1 bg-slate-100 rounded-[2rem] flex items-center px-4 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                 <input 
                    ref={inputRef}
                    className={`flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 max-h-32 w-full font-medium ${isSeniorMode ? 'text-xl' : 'text-base'}`}
                    placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 />
             </div>
             
             <button 
                onClick={handleMicClick} 
                className={`rounded-full h-12 w-12 flex items-center justify-center touch-target transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                }`}
             >
                 {isListening ? <MicOff size={24} /> : <Mic size={24} />}
             </button>
             
             <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() && !attachedFile} 
                className="bg-blue-600 rounded-full text-white h-12 w-12 flex items-center justify-center shadow-lg shadow-blue-200 active-scale touch-target disabled:opacity-50 disabled:shadow-none transition-all hover:bg-blue-700"
             >
                 <Send size={24} className="ml-0.5" />
             </button>
        </div>

        {/* Emergency Modal */}
        {showEmergencyModal && (
            <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden p-8 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <ShieldAlert size={48} className="text-red-600" />
                    </div>
                    <h2 className="text-3xl font-black uppercase mb-2 text-slate-900">KHẨN CẤP!</h2>
                    <p className="text-slate-500 mb-8 font-medium">Bạn đang gặp nguy hiểm? Hãy gọi ngay cho cơ quan chức năng.</p>
                    
                    <button onClick={() => window.open('tel:113')} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-200 mb-4 touch-target active:scale-95 transition-transform">
                        <Phone size={32} fill="currentColor" /> GỌI 113
                    </button>
                    <button onClick={() => setShowEmergencyModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xl touch-target hover:bg-slate-200 transition-colors">
                        Đóng lại
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ChatScreen;
