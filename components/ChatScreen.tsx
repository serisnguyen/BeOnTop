
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, ShieldAlert, Loader2, 
  Shield, AlertTriangle, 
  Phone, Search, Zap, Volume2, StopCircle, Mic, 
  Paperclip, Image as ImageIcon, FileText, FileAudio, Video, MicOff
} from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { Tab } from '../App';

// --- Types ---
interface ChatScreenProps {
  onNavigate: (tab: Tab) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isRisk?: boolean;
  groundingChunks?: any[];
  suggestedActions?: {
    label: string;
    icon: any;
    action: () => void;
    color: string;
  }[];
  attachment?: {
      name: string;
      type: string;
      size: number;
  };
}

const OFFLINE_RESPONSES: Record<string, string> = {
  'công an': 'Công an KHÔNG BAO GIỜ làm việc qua điện thoại hay yêu cầu chuyển tiền. Nếu ai đó tự xưng là công an gọi đến, hãy cúp máy ngay và ra đồn công an gần nhất.',
  'chuyển tiền': 'CẢNH BÁO: Tuyệt đối không chuyển tiền cho người lạ hoặc người thân yêu cầu gấp qua tin nhắn/Facebook mà chưa gọi video xác thực. Có thể là lừa đảo Deepfake.',
  'mật khẩu': 'KHÔNG BAO GIỜ cung cấp mật khẩu, mã OTP cho bất kỳ ai, kể cả nhân viên ngân hàng. Ngân hàng không bao giờ hỏi OTP của bạn.',
  'trúng thưởng': 'Cẩn thận chiêu trò trúng thưởng ảo. Nếu họ yêu cầu nạp tiền phí vận chuyển hay thuế trước khi nhận giải, đó là LỪA ĐẢO 100%.',
  'việc nhẹ': 'Cảnh báo lừa đảo "Việc nhẹ lương cao", tuyển cộng tác viên Shopee/Lazada/TikTok. Đừng nạp tiền làm nhiệm vụ.',
};

const ChatScreen: React.FC<ChatScreenProps> = ({ onNavigate }) => {
  const { user, isSeniorMode, speakUI, triggerHaptic } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'safe' | 'warning' | 'danger'>('safe');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  // Input State
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

  // --- VOICE OUTPUT (TTS) ---
  const speakMessage = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      
      if (speakingMsgId === id) {
          setSpeakingMsgId(null);
          return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = isSeniorMode ? 0.85 : 1.0; 
      
      utterance.onstart = () => setSpeakingMsgId(id);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  };

  // --- INITIALIZE CHAT ---
  useEffect(() => {
    const initChat = async () => {
      try {
          const apiKey = process.env.API_KEY || "";
          
          const baseInstruction = `
            Bạn là TruthShield AI - Trợ lý An ninh mạng 24/7 chuyên về chống lừa đảo tại Việt Nam.
            Người dùng hiện tại: ${user?.name || 'Bạn'}, ${isSeniorMode ? 'là Người Cao Tuổi' : 'người dùng phổ thông'}.
            Nhiệm vụ: Phân tích rủi ro, tìm địa điểm (đồn công an, ngân hàng) qua Google Maps, hướng dẫn dùng app.
            Quy tắc: Không khuyên chuyển tiền, không hỏi OTP. Luôn cảnh báo nếu có dấu hiệu lừa đảo.
            Phản hồi: Ngắn gọn, súc tích, dễ hiểu.
          `;

          if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            chatSessionRef.current = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: {
                systemInstruction: baseInstruction,
                tools: [{ googleMaps: {} }], 
              },
            });
          }

          if (messages.length === 0) {
              const greeting = isSeniorMode 
                  ? `Chào bác ${user?.name || ''}! Cháu là Trợ lý An ninh. Bác cần giúp gì cứ nhắn hoặc nói cho cháu nhé.`
                  : `Xin chào ${user?.name || 'bạn'}! Tôi là Trợ lý An ninh TruthShield. Tôi có thể giúp bạn kiểm tra tin nhắn lừa đảo hoặc tư vấn về an toàn.`;
                  
              const welcomeMsg = {
                id: 'welcome',
                role: 'model' as const,
                text: greeting
              };
              setMessages([welcomeMsg]);
          }

      } catch (error) {
          console.error("Chat init error:", error);
      }
    };
    initChat();
    return () => {
        stopSpeaking();
        if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [user, isSeniorMode]);

  // --- DETECT ACTIONS ---
  const detectActions = (text: string) => {
    const lower = text.toLowerCase();
    const actions = [];

    if (lower.includes('deepfake') || lower.includes('video') || lower.includes('khuôn mặt') || lower.includes('giọng nói')) {
       actions.push({
         label: 'Mở Quét Deepfake',
         icon: <Zap size={16}/>,
         action: () => onNavigate('scanner'),
         color: 'bg-purple-600'
       });
    }
    if (lower.includes('số lạ') || lower.includes('số điện thoại') || lower.includes('gọi điện') || lower.includes('tra cứu')) {
       actions.push({
         label: 'Tra cứu số này',
         icon: <Search size={16}/>,
         action: () => onNavigate('lookup'),
         color: 'bg-blue-600'
       });
    }
    if (lower.includes('công an') || lower.includes('lừa đảo') || lower.includes('khẩn cấp') || lower.includes('113')) {
       actions.push({
         label: 'Gọi 113 Khẩn Cấp', 
         icon: <ShieldAlert size={16}/>,
         action: () => setShowEmergencyModal(true), 
         color: 'bg-red-600'
       });
    }

    return actions;
  };

  // --- INPUT HANDLERS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
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

      recognition.onstart = () => {
         if(isSeniorMode) speakUI("Đang nghe bác nói...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if(isSeniorMode) speakUI("Cháu không nghe rõ, bác nói lại nhé.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      setTimeout(() => {
        const simulatedText = "Số 0909 này có phải lừa đảo không?";
        setInput((prev) => (prev ? prev + ' ' + simulatedText : simulatedText));
        setIsListening(false);
      }, 2000);
    }
  };

  const getFileIcon = (type: string) => {
      if (type.startsWith('image/')) return <ImageIcon size={14} className="text-purple-600" />;
      if (type.startsWith('audio/')) return <FileAudio size={14} className="text-amber-600" />;
      if (type.startsWith('video/')) return <Video size={14} className="text-blue-600" />;
      return <FileText size={14} className="text-slate-600" />;
  };

  // --- HANDLE SEND ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    
    if ((!textToSend.trim() && !attachedFile) || isLoading) return;

    const currentFile = attachedFile;
    const currentFileMeta = currentFile ? { 
        name: currentFile.name, 
        type: currentFile.type,
        size: currentFile.size 
    } : undefined;

    setInput('');
    setAttachedFile(null);
    setIsListening(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (recognitionRef.current) recognitionRef.current.stop();
    
    setIsLoading(true);
    stopSpeaking();

    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: textToSend,
        attachment: currentFileMeta
    };
    setMessages(prev => [...prev, userMsg]);

    let responseText = "";
    let groundingChunks: any[] = [];
    let isRisk = false;

    try {
        if (chatSessionRef.current) {
            const prompt = currentFile 
                ? `[Người dùng đã gửi một tệp tin: ${currentFile.name} (${currentFile.type})]. ${textToSend}`
                : textToSend;

            const result = await chatSessionRef.current.sendMessage({ message: prompt });
            responseText = result.text;
            groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        } else {
            throw new Error("No API Key");
        }
    } catch (error) {
        const lowerInput = textToSend.toLowerCase();
        const foundKey = Object.keys(OFFLINE_RESPONSES).find(k => lowerInput.includes(k));
        responseText = foundKey 
            ? OFFLINE_RESPONSES[foundKey] 
            : "Tôi đang mất kết nối máy chủ. Nhưng bác có thể dùng các tính năng có sẵn trong app như 'Tra cứu số' hoặc 'Quét Deepfake' để kiểm tra nhé.";
    } finally {
        if (responseText.includes("[CẢNH BÁO]") || responseText.includes("LỪA ĐẢO") || responseText.includes("NGUY HIỂM")) {
            setRiskLevel('danger');
            isRisk = true;
        } else if (responseText.includes("cẩn thận") || responseText.includes("lưu ý") || responseText.includes("cảnh giác")) {
            setRiskLevel('warning');
        } else {
            setRiskLevel('safe');
        }

        const cleanText = responseText.replace("[CẢNH BÁO]", "").trim();
        const actions = detectActions(textToSend + " " + cleanText);

        const modelMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: cleanText,
            isRisk,
            groundingChunks,
            suggestedActions: actions
        };

        setMessages(prev => [...prev, modelMsg]);
        setIsLoading(false);
    }
  };

  const quickSuggestions = [
      "Kiểm tra số 0909...",
      "Lừa đảo trúng thưởng?",
      "Tìm đồn công an",
      "Việc nhẹ lương cao",
      "Cách chặn số rác",
      "Báo cáo lừa đảo"
  ];

  // --- CONDITIONAL STYLES ---
  // Senior Mode Text Scaling
  const messageTextClass = isSeniorMode ? 'text-xl leading-relaxed p-4' : 'text-sm leading-relaxed p-3';
  const inputTextClass = isSeniorMode ? 'text-xl' : 'text-base';
  const suggestionTextClass = isSeniorMode ? 'text-base px-4 py-3' : 'text-xs px-3 py-1.5';
  const iconSize = isSeniorMode ? 28 : 20;

  return (
    <div className={`flex flex-col h-full bg-[#F8FAFC] relative overflow-hidden animate-in fade-in duration-300`}>
        
        {/* HEADER */}
        <div className={`px-4 py-3 border-b transition-colors duration-500 z-10 shadow-sm flex items-center gap-3 bg-white`}>
            <div className={`rounded-full flex items-center justify-center shadow-inner flex-shrink-0 w-10 h-10 ${
                 riskLevel === 'safe' ? 'bg-blue-100 text-blue-600' : 
                 riskLevel === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
                {riskLevel === 'danger' ? <ShieldAlert size={iconSize} /> : 
                 riskLevel === 'warning' ? <AlertTriangle size={iconSize} /> : 
                 <Bot size={iconSize} />}
            </div>
            <div className="flex-1 min-w-0">
                <h2 className={`font-black leading-none text-slate-900 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                    {riskLevel === 'danger' ? 'CẢNH BÁO RỦI RO' : 
                     riskLevel === 'warning' ? 'Cần Cảnh Giác' : 
                     'Trợ Lý An Ninh AI'}
                </h2>
                <p className={`font-bold uppercase tracking-wide opacity-80 mt-1 flex items-center gap-1 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                    <span className={`w-2 h-2 rounded-full ${riskLevel === 'safe' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    {riskLevel === 'danger' ? 'Phát hiện lừa đảo' : 'Đang trực tuyến'}
                </p>
            </div>
            {speakingMsgId && (
                <button onClick={stopSpeaking} className={`p-2 bg-slate-100 rounded-full text-slate-600 animate-pulse`}>
                    <Volume2 size={iconSize} />
                </button>
            )}
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40 scroll-smooth">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[98%] md:max-w-[85%]`}>
                        
                        {/* Bot Avatar */}
                        {msg.role === 'model' && (
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-1 shadow-sm ${
                                msg.isRisk ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                <Shield size={isSeniorMode ? 20 : 16} />
                            </div>
                        )}

                        {/* Bubble */}
                        <div className={`rounded-2xl shadow-sm whitespace-pre-wrap relative group ${messageTextClass} ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                : msg.isRisk 
                                    ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-sm' 
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}>
                            
                            {msg.attachment && (
                                <div className={`mb-2 p-2 rounded-xl flex items-center gap-3 ${msg.role === 'user' ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-white/20' : 'bg-white'}`}>
                                        {getFileIcon(msg.attachment.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`text-xs font-bold truncate max-w-[120px] ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                                            {msg.attachment.name}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {msg.text}
                        </div>

                        {/* TTS Button - NEXT TO BUBBLE (Same Flex Container) */}
                        {msg.role === 'model' && (
                            <button 
                                onClick={() => speakMessage(msg.text, msg.id)}
                                className={`p-2 rounded-full flex-shrink-0 transition-colors self-center ${
                                    speakingMsgId === msg.id 
                                    ? 'bg-blue-100 text-blue-600 animate-pulse' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                                aria-label="Đọc tin nhắn"
                            >
                                {speakingMsgId === msg.id ? <StopCircle size={isSeniorMode ? 28 : 20} /> : <Volume2 size={isSeniorMode ? 28 : 20} />}
                            </button>
                        )}
                    </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="flex justify-start">
                     <div className={`bg-slate-100 text-slate-500 rounded-2xl rounded-tl-sm flex items-center gap-2 ${messageTextClass}`}>
                         <Loader2 size={isSeniorMode ? 24 : 20} className="animate-spin" />
                         <span className="font-bold">AI đang phân tích...</span>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR - ALWAYS VISIBLE, SAME LAYOUT */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 pb-safe">
            {/* Quick Suggestions */}
            <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar bg-slate-50/50 backdrop-blur-sm border-b border-slate-100">
                {quickSuggestions.map((suggestion, idx) => (
                    <button key={idx} onClick={() => handleSend(suggestion)} className={`bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 rounded-full font-bold whitespace-nowrap shadow-sm transition-colors ${suggestionTextClass}`}>
                        {suggestion}
                    </button>
                ))}
            </div>

            {/* Main Input Row */}
            <div className="p-3 flex items-end gap-2 max-w-4xl mx-auto">
                 <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0 flex items-center justify-center h-12 w-12`}
                 >
                     <Paperclip size={iconSize} />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,audio/*,video/*,.pdf,.txt" />
                 
                 <div className={`flex-1 bg-slate-100 rounded-[2rem] flex items-center border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all py-2 px-4`}>
                     <input 
                        ref={inputRef}
                        className={`flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 max-h-32 w-full ${inputTextClass} ${isListening ? 'animate-pulse placeholder:text-blue-500' : ''}`}
                        placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     />
                 </div>
                 
                 <button 
                    onClick={handleMicClick} 
                    className={`rounded-full transition-all flex-shrink-0 flex items-center justify-center h-12 w-12 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                 >
                     {isListening ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
                 </button>
                 
                 <button 
                    onClick={() => handleSend()} 
                    disabled={(!input.trim() && !attachedFile) || isLoading} 
                    className={`bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex-shrink-0 h-12 w-12`}
                 >
                     {isLoading ? <Loader2 size={iconSize} className="animate-spin" /> : <Send size={iconSize} className="ml-0.5" />}
                 </button>
            </div>
        </div>

        {/* Safety Modal */}
        {showEmergencyModal && (
            <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden">
                    <div className="bg-red-600 p-8 text-white text-center">
                        <ShieldAlert size={64} className="mx-auto mb-4 animate-pulse" />
                        <h2 className="text-3xl font-black uppercase">KHẨN CẤP!</h2>
                    </div>
                    <div className="p-6 grid gap-4">
                        <button onClick={() => window.open('tel:113')} className="w-full py-6 bg-red-600 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-lg">
                            <Phone size={32} fill="currentColor" /> GỌI 113
                        </button>
                        <button onClick={() => setShowEmergencyModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xl">
                            Đóng lại
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ChatScreen;
