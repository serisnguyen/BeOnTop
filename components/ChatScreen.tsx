
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, ShieldAlert, Loader2, MapPin, 
  Navigation, Shield, AlertTriangle, 
  Phone, Search, Zap, Volume2, StopCircle, Mic, X, 
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
  const { user, isSeniorMode } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'safe' | 'warning' | 'danger'>('safe');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  // Input State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false); // Dictation State
  
  // New State for Safety Interstitial
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = isSeniorMode ? 0.9 : 1.0;
      utterance.onstart = () => setSpeakingMsgId(id);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      speechRef.current = utterance;
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
              setMessages([{
                id: 'welcome',
                role: 'model',
                text: isSeniorMode 
                  ? `Chào bác ${user?.name || ''}! Cháu là Trợ lý An ninh AI.\nBác có nhận được tin nhắn hay cuộc gọi lạ nào không? Cháu sẽ giúp bác kiểm tra ngay.`
                  : `Xin chào ${user?.name || 'bạn'}! Tôi là Trợ lý An ninh TruthShield.\n\nTôi có thể giúp bạn kiểm tra tin nhắn lừa đảo, tìm đồn công an gần nhất, hoặc tư vấn về các thủ đoạn lừa đảo mới. Bạn cần hỗ trợ gì không?`
              }]);
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
    if (lower.includes('tin nhắn') || lower.includes('link') || lower.includes('sms')) {
       actions.push({
         label: 'Kiểm tra tin nhắn',
         icon: <Shield size={16}/>,
         action: () => onNavigate('messagescan'),
         color: 'bg-green-600'
       });
    }
    if (lower.includes('công an') || lower.includes('lừa đảo') || lower.includes('khẩn cấp') || lower.includes('113') || lower.includes('báo cáo')) {
       actions.push({
         label: 'Hỗ trợ khẩn cấp', 
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
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    // Browser Speech API support check
    const Window = window as any;
    const SpeechRecognition = Window.SpeechRecognition || Window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
         // UI update handled by state
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        // Optional: Could trigger fallback here, but simpler to just stop on error
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      // Fallback Simulation
      setTimeout(() => {
        const simulatedText = "Số 0909 này có phải lừa đảo không?";
        setInput((prev) => (prev ? prev + ' ' + simulatedText : simulatedText));
        setIsListening(false);
      }, 2000);
    }
  };

  const removeAttachment = () => {
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    
    // Allow sending if text OR file exists
    if ((!textToSend.trim() && !attachedFile) || isLoading) return;

    const currentFile = attachedFile;
    const currentFileMeta = currentFile ? { 
        name: currentFile.name, 
        type: currentFile.type,
        size: currentFile.size 
    } : undefined;

    // Reset Input UI
    setInput('');
    setAttachedFile(null);
    setIsListening(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (recognitionRef.current) recognitionRef.current.stop();
    
    setIsLoading(true);
    stopSpeaking();

    // 1. Add User Message
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
        
        if (isSeniorMode) {
            speakMessage(cleanText, modelMsg.id);
        }
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

  return (
    <div className={`flex flex-col h-full bg-[#F8FAFC] relative overflow-hidden animate-in fade-in duration-300 ${isSeniorMode ? 'text-lg' : ''}`}>
        
        {/* --- HEADER --- */}
        <div className={`px-4 py-4 border-b transition-colors duration-500 z-10 shadow-sm flex items-center gap-3 ${
            riskLevel === 'danger' ? 'bg-red-600 text-white border-red-700' :
            riskLevel === 'warning' ? 'bg-amber-500 text-white border-amber-600' :
            'bg-white text-slate-900 border-slate-200'
        }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${
                 riskLevel === 'safe' ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'
            }`}>
                {riskLevel === 'danger' ? <ShieldAlert size={28} className="animate-pulse" /> : 
                 riskLevel === 'warning' ? <AlertTriangle size={28} /> : 
                 <Bot size={28} />}
            </div>
            <div className="flex-1">
                <h2 className={`font-black leading-none ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                    {riskLevel === 'danger' ? 'CẢNH BÁO RỦI RO CAO' : 
                     riskLevel === 'warning' ? 'Cần Cảnh Giác' : 
                     'Trợ Lý An Ninh AI'}
                </h2>
                <p className={`font-bold uppercase tracking-wide opacity-80 mt-1 flex items-center gap-1 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                    <span className={`w-2 h-2 rounded-full ${riskLevel === 'safe' ? 'bg-green-500' : 'bg-white animate-pulse'}`}></span>
                    {riskLevel === 'danger' ? 'Phát hiện dấu hiệu lừa đảo' : 'Đang trực tuyến 24/7'}
                </p>
            </div>
            {speakingMsgId && (
                <button onClick={stopSpeaking} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors animate-pulse">
                    <Volume2 size={24} />
                </button>
            )}
        </div>

        {/* --- CHAT AREA --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40 scroll-smooth">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    
                    <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[95%] md:max-w-[85%]`}>
                        {msg.role === 'model' && (
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-1 shadow-sm ${
                                msg.isRisk ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                <Shield size={16} />
                            </div>
                        )}

                        <div className={`p-4 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                : msg.isRisk 
                                    ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-sm' 
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        } ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
                            
                            {/* Attachment Display */}
                            {msg.attachment && (
                                <div className={`mb-3 p-2 rounded-xl flex items-center gap-3 ${msg.role === 'user' ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-white/20' : 'bg-white'}`}>
                                        {getFileIcon(msg.attachment.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`text-xs font-bold truncate max-w-[150px] ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                                            {msg.attachment.name}
                                        </div>
                                        <div className={`text-[10px] opacity-80 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                                            {Math.round(msg.attachment.size / 1024)} KB
                                        </div>
                                    </div>
                                </div>
                            )}

                            {msg.text}

                            {msg.role === 'model' && (
                                <div className="mt-2 flex justify-end">
                                    <button 
                                        onClick={() => speakingMsgId === msg.id ? stopSpeaking() : speakMessage(msg.text, msg.id)}
                                        className={`p-1.5 rounded-full transition-colors ${
                                            msg.isRisk ? 'hover:bg-red-100 text-red-400' : 'hover:bg-slate-100 text-slate-400'
                                        } ${speakingMsgId === msg.id ? 'text-blue-600 bg-blue-50' : ''}`}
                                    >
                                        {speakingMsgId === msg.id ? <StopCircle size={isSeniorMode ? 24 : 16} /> : <Volume2 size={isSeniorMode ? 24 : 16} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mt-2 w-full pl-10">
                            {msg.groundingChunks.map((chunk, idx) => {
                                if (chunk.web?.uri && (chunk.web.uri.includes('google.com/maps') || chunk.web.title)) {
                                    return (
                                        <a 
                                            key={idx}
                                            href={chunk.web.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 w-72 group"
                                        >
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                                <MapPin size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-slate-800 text-base truncate">{chunk.web.title}</div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                                                    Mở Google Maps <Navigation size={10} />
                                                </div>
                                            </div>
                                        </a>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}

                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 pl-10">
                            {msg.suggestedActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={action.action}
                                    className={`${action.color} text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
                                >
                                    {action.icon} {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            ))}
            
            {isLoading && (
                <div className="flex justify-start">
                     <div className="bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                         <Loader2 size={20} className="animate-spin" />
                         <span className="font-bold">AI đang phân tích...</span>
                     </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>

        {/* --- MULTIMODAL INPUT BAR --- */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 pb-safe">
            
            {/* Quick Suggestions Chips */}
            <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar bg-slate-50/50 backdrop-blur-sm border-b border-slate-100">
                {quickSuggestions.map((suggestion, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all active:scale-95"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

            {/* Attachment Preview */}
            {attachedFile && (
                <div className="px-4 pt-2">
                    <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 pr-3 pl-3 py-2 rounded-xl animate-in slide-in-from-bottom-2">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            {getFileIcon(attachedFile.type)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{attachedFile.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{(attachedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button onClick={removeAttachment} className="ml-2 p-1 hover:bg-blue-100 rounded-full text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Row */}
            <div className="p-3 md:p-4 flex items-end gap-2 max-w-4xl mx-auto">
                 {/* Upload Button */}
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
                    title="Đính kèm tệp"
                 >
                     <Paperclip size={24} />
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect} 
                    accept="image/*,audio/*,video/*,.pdf,.txt"
                 />

                 {/* Text Input */}
                 <div className={`flex-1 bg-slate-100 rounded-[1.5rem] flex items-center px-4 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all ${
                     isSeniorMode ? 'py-3' : 'py-2'
                 }`}>
                     <input 
                        ref={inputRef}
                        className={`flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 max-h-32 ${
                            isSeniorMode ? 'text-xl' : 'text-base'
                        } ${isListening ? 'animate-pulse placeholder:text-blue-500' : ''}`}
                        placeholder={isListening ? "Đang nghe bạn nói..." : (isSeniorMode ? "Nhập câu hỏi của bác..." : "Nhập tin nhắn...")}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     />
                 </div>

                 {/* Mic Button (Dictation) */}
                 <button 
                    onClick={handleMicClick}
                    className={`p-3 rounded-full transition-all flex-shrink-0 ${
                        isListening 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse scale-110' 
                        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Nhập bằng giọng nói"
                 >
                     {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                 </button>

                 {/* Send Button */}
                 <button 
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !attachedFile) || isLoading}
                    className={`rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex-shrink-0 ${
                        riskLevel === 'danger' ? 'bg-red-600 shadow-red-200' : 'bg-blue-600 shadow-blue-200'
                    } ${isSeniorMode ? 'w-14 h-14' : 'w-12 h-12'}`}
                 >
                     {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={isSeniorMode ? 28 : 20} className="ml-0.5" />}
                 </button>
            </div>
        </div>

        {/* --- SAFETY INTERSTITIAL --- */}
        {showEmergencyModal && (
            <div 
                className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                    <div className="bg-red-600 p-6 text-white text-center relative">
                        <button 
                            onClick={() => setShowEmergencyModal(false)}
                            className="absolute top-4 right-4 p-2 bg-red-700/50 hover:bg-red-700 rounded-full text-white/80 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                             <ShieldAlert size={40} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">HƯỚNG DẪN KHẨN CẤP</h2>
                    </div>
                    <div className="p-6 bg-red-50">
                        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm mb-6">
                            <ul className="space-y-3 text-slate-700 text-sm">
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-bold text-lg leading-none">•</span>
                                    <span>Hãy <span className="font-bold">giữ bình tĩnh</span>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-bold text-lg leading-none">•</span>
                                    <span>Di chuyển đến nơi <span className="font-bold">đông người</span> hoặc đồn công an.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-bold text-lg leading-none">•</span>
                                    <span>Tuyệt đối <span className="font-bold text-red-600">không chuyển tiền</span>.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="grid gap-3">
                            <button 
                                onClick={() => {
                                    window.open('tel:113');
                                    setShowEmergencyModal(false);
                                }}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-lg shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-2 animate-pulse"
                            >
                                <Phone size={24} fill="currentColor" /> GỌI 113 NGAY
                            </button>
                            <button 
                                onClick={() => setShowEmergencyModal(false)}
                                className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default ChatScreen;
