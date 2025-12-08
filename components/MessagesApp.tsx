
import React, { useState, useRef, useCallback } from 'react';
import { 
  MessageSquareText, Search, Edit, ChevronLeft, Send, 
  ShieldAlert, AlertTriangle, MoreVertical, CheckCircle2, 
  ShieldCheck, Copy, Trash2, Share2, ScanLine, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzeMessageRisk } from '../services/aiService';

// Mock Conversation Data
const INITIAL_CONVERSATIONS = [
    {
        id: '1',
        sender: 'Vietcombank',
        preview: 'Tai khoan cua quy khach da bi khoa. Vui long dang nhap...',
        timestamp: '10:45',
        isUnread: true,
        risk: 'scam' as const,
        avatarColor: 'bg-green-600'
    },
    {
        id: '2',
        sender: 'Mẹ Yêu',
        preview: 'Con về ăn cơm chưa? Mẹ nấu món canh chua rồi nè.',
        timestamp: '09:30',
        isUnread: false,
        risk: 'safe' as const,
        avatarColor: 'bg-pink-500'
    },
    {
        id: '3',
        sender: '0909 999 888',
        preview: 'Chuc mung ban da trung thuong xe may SH. Soan tin...',
        timestamp: 'Hôm qua',
        isUnread: true,
        risk: 'suspicious' as const,
        avatarColor: 'bg-slate-500'
    },
    {
        id: '4',
        sender: 'GiaoHangTietKiem',
        preview: 'Don hang DH123 dang duoc giao den ban. Vui long chu y dien thoai.',
        timestamp: 'Hôm qua',
        isUnread: false,
        risk: 'safe' as const,
        avatarColor: 'bg-orange-500'
    },
    {
        id: '5',
        sender: '0868 123 456',
        preview: 'TB: Quy khach duoc phe duyet khoan vay 50.000.000 VND. Lai suat 0%. L/H Zalo 09xx...',
        timestamp: 'Hôm kia',
        isUnread: true,
        risk: 'suspicious' as const,
        avatarColor: 'bg-purple-600'
    }
];

const MessagesApp: React.FC = () => {
  const { isSeniorMode, user, addMessageAnalysis, clearMessageHistory } = useAuth();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'scan'>('inbox');
  
  // Detail View State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Manual Scan State
  const [scanInput, setScanInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<'safe' | 'suspicious' | 'scam' | null>(null);
  const [explanation, setExplanation] = useState('');
  const hasHistory = user?.messageHistory && user.messageHistory.length > 0;

  // --- HANDLERS ---
  const openChat = (id: string) => {
      setActiveChat(id);
      const conv = conversations.find(c => c.id === id);
      setMessages([
          { id: 1, text: conv?.preview || '', isMe: false, time: conv?.timestamp }
      ]);
      if (conv?.risk !== 'safe') {
          handleAnalyze(conv?.preview || '');
      } else {
          setAiAnalysis(null);
      }
  };

  const handleAnalyze = async (text: string) => {
      setAiAnalysis({ loading: true });
      try {
          const result = await analyzeMessageRisk(text);
          setAiAnalysis(result);
          addMessageAnalysis({
              text: text,
              result: result.result,
              explanation: result.explanation
          });
      } catch (e) {
          setAiAnalysis(null);
      }
  };

  const handleSend = () => {
      if (!inputText.trim()) return;
      setMessages(prev => [...prev, {
          id: Date.now(),
          text: inputText,
          isMe: true,
          time: 'Vừa xong'
      }]);
      setInputText('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const analyzeManualMessage = useCallback(async () => {
    if (!scanInput.trim()) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeMessageRisk(scanInput);
      setResult(analysis.result);
      setExplanation(analysis.explanation);
      addMessageAnalysis({
        text: scanInput,
        result: analysis.result,
        explanation: analysis.explanation
      });

    } catch (error) {
      setResult('suspicious');
      setExplanation("Có lỗi xảy ra khi kết nối. Hãy cẩn trọng.");
    } finally {
      setAnalyzing(false);
    }
  }, [scanInput, addMessageAnalysis]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const resultText = result === 'safe' ? 'AN TOÀN' : result === 'scam' ? 'LỪA ĐẢO' : 'CẦN CẢNH GIÁC';
    const shareData = {
        title: 'Cảnh báo từ TruthShield AI',
        text: `[Kiểm tra tin nhắn]\nKết quả: ${resultText}\n\nĐánh giá: ${explanation}\n\nNội dung gốc: "${scanInput}"`,
    };
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) { console.log('Share canceled'); }
    } else {
        try { await navigator.clipboard.writeText(shareData.text); alert('Đã sao chép!'); } catch (e) { alert('Lỗi sao chép.'); }
    }
  }, [result, explanation, scanInput]);

   const getResultColor = (res: 'safe' | 'suspicious' | 'scam') => {
      switch(res) {
          case 'safe': return 'text-green-600 bg-green-50 border-green-200';
          case 'scam': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-amber-600 bg-amber-50 border-amber-200';
      }
  };

  // --- RENDER LIST & SCAN ---
  if (!activeChat) {
      return (
        <div className={`h-full flex flex-col bg-white animate-in fade-in duration-300 w-full shadow-sm`}>
            {/* Header */}
            <div className="px-4 py-4 bg-white/95 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-2xl text-slate-900">Tin Nhắn</h2>
                    {activeTab === 'inbox' && (
                        <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-blue-600">
                            <Edit size={20} />
                        </button>
                    )}
                </div>
                
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'inbox' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <MessageSquareText size={16} /> Hộp Thư
                    </button>
                    <button 
                        onClick={() => setActiveTab('scan')}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <ScanLine size={16} /> Scan (Quét AI)
                    </button>
                </div>
            </div>

            {activeTab === 'inbox' ? (
                <>
                    {/* Search */}
                    <div className="px-4 mb-2 mt-2">
                        <div className="bg-slate-100 rounded-xl flex items-center px-4 py-2.5">
                            <Search size={18} className="text-slate-400 mr-2" />
                            <input className="bg-transparent outline-none w-full font-bold text-slate-700 placeholder-slate-400 text-sm" placeholder="Tìm kiếm tin nhắn" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-24">
                        {conversations.map(conv => (
                            <div 
                                key={conv.id} 
                                onClick={() => openChat(conv.id)}
                                className={`flex gap-3 px-4 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 ${conv.isUnread ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative ${conv.avatarColor}`}>
                                    {conv.sender.charAt(0)}
                                    {conv.risk === 'scam' && (
                                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                                            <ShieldAlert size={14} className="text-red-600 fill-red-100" />
                                        </div>
                                    )}
                                    {conv.risk === 'suspicious' && (
                                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                                            <AlertTriangle size={14} className="text-amber-600 fill-amber-100" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className={`font-bold truncate text-slate-900 text-base`}>{conv.sender}</h4>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">{conv.timestamp}</span>
                                    </div>
                                    <p className={`truncate ${conv.isUnread ? 'font-bold text-slate-800' : 'text-slate-500'} text-sm`}>
                                        {conv.preview}
                                    </p>
                                </div>
                                {conv.isUnread && (
                                    <div className="self-center">
                                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-1 overflow-y-auto pb-24 p-4 bg-slate-50/50">
                     <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                        <textarea 
                            className={`w-full bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none resize-none p-4 rounded-xl border focus:border-purple-400 transition-colors ${
                                isSeniorMode ? 'text-2xl h-48 border-slate-300 font-medium' : 'text-base h-40 border-slate-200'
                            }`}
                            placeholder="Dán tin nhắn cần kiểm tra vào đây..."
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                        ></textarea>
                        
                        <div className="p-3 flex gap-2 border-t border-slate-100 bg-white">
                             <button 
                                 onClick={async () => {
                                    try { const text = await navigator.clipboard.readText(); setScanInput(text); } catch (e) { alert("Dán thủ công."); }
                                 }}
                                 className="px-3 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200"
                             >
                                 <Copy size={20} />
                             </button>
                             <button 
                                 onClick={analyzeManualMessage}
                                 disabled={analyzing || !scanInput}
                                 className={`flex-1 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                                     analyzing ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                                 }`}
                             >
                                 {analyzing ? <Sparkles size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                 {analyzing ? 'Checking...' : 'KIỂM TRA'}
                             </button>
                        </div>
                    </div>

                    {result && (
                      <div className={`rounded-3xl p-5 border-2 shadow-sm mb-6 ${
                        result === 'safe' ? 'bg-green-50 border-green-200' : 
                        result === 'scam' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                      }`}>
                          <h3 className={`font-black uppercase tracking-wide mb-1 ${
                                result === 'safe' ? 'text-green-700' : result === 'scam' ? 'text-red-700' : 'text-amber-700'
                            }`}>
                                {result === 'safe' ? 'An Toàn' : result === 'scam' ? 'LỪA ĐẢO' : 'Cần Cảnh Giác'}
                            </h3>
                            <p className="text-slate-700 font-medium text-sm">{explanation}</p>
                            <button onClick={handleShare} className="w-full mt-3 bg-white border border-current py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 opacity-80 hover:opacity-100">
                                <Share2 size={16} /> Chia sẻ
                            </button>
                      </div>
                    )}

                    {hasHistory && (
                        <div className="mt-4 border-t border-slate-200 pt-4">
                            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-3">Lịch sử quét</h3>
                            <div className="space-y-3">
                                {user.messageHistory.map((item) => (
                                    <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getResultColor(item.result)}`}>
                                                {item.result}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-xs line-clamp-1 italic mb-1">"{item.text}"</p>
                                    </div>
                                ))}
                                <button onClick={clearMessageHistory} className="w-full py-2 text-slate-400 text-xs font-bold hover:text-red-500 flex items-center justify-center gap-1">
                                    <Trash2 size={12} /> Xóa lịch sử
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      );
  }
  
  // RENDER DETAIL CHAT
  return (
    <div className={`h-full flex flex-col bg-white animate-in slide-in-from-right duration-300 w-full`}>
         <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center gap-3 sticky top-0 z-20">
             <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600">
                 <ChevronLeft size={24} />
             </button>
             <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-lg">{conversations.find(c => c.id === activeChat)?.sender}</h3>
             </div>
             <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                 <MoreVertical size={20} />
             </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
             {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                         msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                     }`}>
                         <p className={isSeniorMode ? 'text-lg' : 'text-sm'}>{msg.text}</p>
                         <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</p>
                     </div>
                 </div>
             ))}
             
             {aiAnalysis && !aiAnalysis.loading && (
                 <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                     <div className={`max-w-[90%] rounded-2xl p-3 shadow-sm border-l-4 ${
                         aiAnalysis.result === 'scam' ? 'bg-red-50 border-red-500' :
                         aiAnalysis.result === 'suspicious' ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'
                     }`}>
                         <div className="flex items-center gap-1.5 mb-1">
                             <Sparkles size={14} className={
                                 aiAnalysis.result === 'scam' ? 'text-red-600' :
                                 aiAnalysis.result === 'suspicious' ? 'text-amber-600' : 'text-green-600'
                             } />
                             <span className="font-bold text-[10px] uppercase text-slate-500">AI Analysis</span>
                         </div>
                         <p className={`font-bold text-sm ${
                              aiAnalysis.result === 'scam' ? 'text-red-700' :
                              aiAnalysis.result === 'suspicious' ? 'text-amber-700' : 'text-green-700'
                         }`}>
                             {aiAnalysis.result === 'scam' ? 'LỪA ĐẢO' : aiAnalysis.result === 'suspicious' ? 'CẢNH GIÁC' : 'AN TOÀN'}
                         </p>
                         <p className="text-xs text-slate-700 mt-0.5">{aiAnalysis.explanation}</p>
                     </div>
                 </div>
             )}
             <div ref={messagesEndRef} />
         </div>

         {/* Chat Input - Adjusted Padding to avoid Bottom Tab Bar Overlap if it existed, but here we likely want it visible above keyboard */}
         <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 pb-safe md:pb-4 z-20 sticky bottom-0">
             <button 
                onClick={() => {
                     const lastReceived = [...messages].reverse().find(m => !m.isMe);
                     if (lastReceived) handleAnalyze(lastReceived.text);
                }}
                className="p-2.5 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 active:scale-95 transition-all"
             >
                 <ShieldCheck size={20} />
             </button>

             <input 
                 className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                 placeholder="Nhập tin nhắn..."
                 value={inputText}
                 onChange={e => setInputText(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
             />
             <button 
                 onClick={handleSend}
                 disabled={!inputText.trim()}
                 className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
             >
                 <Send size={18} className="ml-0.5" />
             </button>
         </div>
    </div>
  );
};

export default MessagesApp;
